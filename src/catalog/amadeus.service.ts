import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { FlightSearchDto } from './dto/flight-search.dto';

export class AmadeusRateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'AmadeusRateLimitError';
  }
}

export class AmadeusServerError extends Error {
  constructor(
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'AmadeusServerError';
  }
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Circuit is open, failing fast
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

interface AmadeusAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CachedFlightResult {
  data: any;
  timestamp: number;
  searchHash: string;
}

@Injectable()
export class AmadeusService {
  private readonly logger = new Logger(AmadeusService.name);
  private cachedToken: string | null = null;
  private tokenExpiry = 0;

  // Enhanced caching for flight search results - more aggressive
  private flightCache = new Map<string, CachedFlightResult>();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 60 minutes for successful responses (increased from 30)
  private readonly ERROR_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for error responses (increased from 5)

  // Rate limiting state - more aggressive
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 500; // Increased to 500ms between requests (2 requests per second max)
  private rateLimitCooldown = 0;

  // Time-based rate limiting (sliding window)
  private requestTimestamps: number[] = [];
  private readonly MAX_REQUESTS_PER_MINUTE = 30; // Max 30 requests per minute
  private readonly MAX_REQUESTS_PER_HOUR = 200; // Max 200 requests per hour

  // Retry configuration
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_BASE_DELAY = 1000; // 1 second
  private readonly RETRY_JITTER_MAX = 500; // Max 500ms jitter

  // Request deduplication - prevent duplicate concurrent requests
  private pendingRequests = new Map<string, Promise<any>>();

  // Circuit breaker state - more conservative
  private circuitState: CircuitState = CircuitState.CLOSED;
  private circuitFailureCount = 0;
  private circuitLastFailureTime = 0;
  private circuitNextAttemptTime = 0;
  private readonly CIRCUIT_FAILURE_THRESHOLD = 3; // Open circuit after 3 failures (more conservative)
  private readonly CIRCUIT_TIMEOUT = 10 * 60 * 1000; // 10 minutes before trying half-open (increased from 5)
  private readonly CIRCUIT_SUCCESS_THRESHOLD = 5; // Close circuit after 5 successes in half-open (more conservative)
  private circuitSuccessCount = 0; // Track successes in half-open state

  private readonly clientId = process.env.AMADEUS_CLIENT_ID;
  private readonly clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  private readonly host =
    process.env.AMADEUS_HOST ?? 'https://test.api.amadeus.com';

  constructor(private readonly http: HttpService) {
    // Set up periodic cache cleanup every 10 minutes
    setInterval(
      () => {
        this.cleanupExpiredEntries();
      },
      10 * 60 * 1000,
    );
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Generate a hash for flight search parameters to enable caching
   */
  private generateSearchHash(params: FlightSearchDto): string {
    const key = JSON.stringify({
      origin: params.originLocationCode,
      destination: params.destinationLocationCode,
      departure: params.departureDate,
      return: params.returnDate,
      adults: params.adults,
      class: params.travelClass,
      max: params.max,
      price: params.maxPrice,
      currency: params.currencyCode,
    });
    return Buffer.from(key)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Get cached flight result if available and not expired
   */
  private getCachedResult(searchHash: string): any | null {
    const cached = this.flightCache.get(searchHash);
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > this.CACHE_DURATION;

    if (isExpired) {
      this.flightCache.delete(searchHash);
      return null;
    }

    this.logger.debug(`Cache hit for flight search: ${searchHash}`);
    return cached.data;
  }

  /**
   * Cache flight search result
   */
  private setCachedResult(
    searchHash: string,
    data: any,
    isError = false,
  ): void {
    const duration = isError ? this.ERROR_CACHE_DURATION : this.CACHE_DURATION;

    // Clean up expired entries more aggressively when cache gets large
    if (this.flightCache.size > 50) {
      this.cleanupExpiredEntries();
    }

    // Limit cache size to prevent memory issues
    if (this.flightCache.size > 200) {
      // Remove oldest entries (simple LRU-like behavior)
      const entries = Array.from(this.flightCache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp,
      );

      const toRemove = entries.slice(0, Math.floor(entries.length * 0.2)); // Remove 20% oldest
      toRemove.forEach(([key]) => this.flightCache.delete(key));

      this.logger.debug(
        `Cleaned up cache, removed ${toRemove.length} old entries`,
      );
    }

    this.flightCache.set(searchHash, {
      data,
      timestamp: Date.now(),
      searchHash,
    });

    this.logger.debug(
      `Cached flight search result: ${searchHash}, error: ${isError}, cache size: ${this.flightCache.size}`,
    );
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, value] of this.flightCache.entries()) {
      const isExpired = now - value.timestamp > this.CACHE_DURATION;
      if (isExpired) {
        this.flightCache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(`Cleaned up ${removedCount} expired cache entries`);
    }
  }

  /**
   * Check time-based rate limits
   */
  private checkTimeBasedRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneHourAgo,
    );

    // Check per-minute limit
    const requestsLastMinute = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    ).length;

    if (requestsLastMinute >= this.MAX_REQUESTS_PER_MINUTE) {
      this.logger.warn(
        `Rate limit: ${requestsLastMinute} requests in last minute (max: ${this.MAX_REQUESTS_PER_MINUTE})`,
      );
      return false;
    }

    // Check per-hour limit
    const requestsLastHour = this.requestTimestamps.length;
    if (requestsLastHour >= this.MAX_REQUESTS_PER_HOUR) {
      this.logger.warn(
        `Rate limit: ${requestsLastHour} requests in last hour (max: ${this.MAX_REQUESTS_PER_HOUR})`,
      );
      return false;
    }

    return true;
  }

  /**
   * Record a request timestamp
   */
  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Check if circuit breaker allows requests
   */
  private canMakeRequest(): boolean {
    const now = Date.now();

    // Check time-based rate limits first
    if (!this.checkTimeBasedRateLimit()) {
      return false;
    }

    switch (this.circuitState) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN:
        if (now >= this.circuitNextAttemptTime) {
          this.circuitState = CircuitState.HALF_OPEN;
          this.logger.warn('Circuit breaker transitioning to HALF_OPEN state');
          return true;
        }
        return false;

      case CircuitState.HALF_OPEN:
        return true;

      default:
        return false;
    }
  }

  /**
   * Record success in circuit breaker
   */
  private recordSuccess(): void {
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.circuitSuccessCount++;
      if (this.circuitSuccessCount >= this.CIRCUIT_SUCCESS_THRESHOLD) {
        this.circuitFailureCount = 0;
        this.circuitSuccessCount = 0;
        this.circuitState = CircuitState.CLOSED;
        this.logger.log(
          `Circuit breaker CLOSED - service recovered after ${this.CIRCUIT_SUCCESS_THRESHOLD} successful requests`,
        );
      } else {
        this.logger.debug(
          `Circuit breaker HALF_OPEN: ${this.circuitSuccessCount}/${this.CIRCUIT_SUCCESS_THRESHOLD} successful requests`,
        );
      }
    } else if (this.circuitState === CircuitState.CLOSED) {
      // Reset failure count on success in closed state
      if (this.circuitFailureCount > 0) {
        this.circuitFailureCount = Math.max(0, this.circuitFailureCount - 1);
      }
    }
  }

  /**
   * Record failure in circuit breaker
   */
  private recordFailure(): void {
    this.circuitFailureCount++;
    this.circuitLastFailureTime = Date.now();

    if (this.circuitState === CircuitState.HALF_OPEN) {
      // Failed in half-open state, immediately go back to open and reset success count
      this.circuitSuccessCount = 0;
      this.circuitState = CircuitState.OPEN;
      this.circuitNextAttemptTime = Date.now() + this.CIRCUIT_TIMEOUT;
      this.logger.warn(
        'Circuit breaker returned to OPEN state after half-open failure',
      );
    } else if (this.circuitFailureCount >= this.CIRCUIT_FAILURE_THRESHOLD) {
      if (this.circuitState !== CircuitState.OPEN) {
        this.circuitState = CircuitState.OPEN;
        this.circuitNextAttemptTime = Date.now() + this.CIRCUIT_TIMEOUT;
        this.logger.error(
          `Circuit breaker OPENED after ${this.circuitFailureCount} failures. Next attempt at ${new Date(this.circuitNextAttemptTime).toISOString()}`,
        );
      }
    }
  }

  /**
   * Get circuit breaker status for monitoring
   */
  getCircuitStatus() {
    return {
      state: this.circuitState,
      failureCount: this.circuitFailureCount,
      lastFailureTime: this.circuitLastFailureTime,
      nextAttemptTime: this.circuitNextAttemptTime,
      queueLength: this.requestQueue.length,
      rateLimitCooldown: this.rateLimitCooldown,
    };
  }

  /**
   * Manually reset circuit breaker (for admin use)
   */
  resetCircuitBreaker(): void {
    this.circuitState = CircuitState.CLOSED;
    this.circuitFailureCount = 0;
    this.circuitLastFailureTime = 0;
    this.circuitNextAttemptTime = 0;
    this.logger.log('Circuit breaker manually reset');
  }

  /**
   * Clear flight cache (for admin use)
   */
  clearFlightCache(): void {
    const size = this.flightCache.size;
    this.flightCache.clear();
    this.logger.log(`Flight cache cleared. Removed ${size} entries`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    const entries = Array.from(this.flightCache.values());
    const totalEntries = entries.length;
    const expiredEntries = entries.filter(
      (entry) => now - entry.timestamp > this.CACHE_DURATION,
    ).length;
    const validEntries = totalEntries - expiredEntries;

    return {
      totalEntries,
      validEntries,
      expiredEntries,
      cacheDuration: this.CACHE_DURATION,
      errorCacheDuration: this.ERROR_CACHE_DURATION,
    };
  }

  /**
   * Execute request with retry logic and jitter
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    searchHash: string,
    retryCount = 0,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const axiosError = error;

      // Don't retry for rate limiting or auth errors
      if (
        axiosError?.response?.status === 429 ||
        axiosError?.response?.status === 401
      ) {
        throw error;
      }

      // Don't retry if we've exceeded max retries
      if (retryCount >= this.MAX_RETRIES) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const baseDelay = this.RETRY_BASE_DELAY * Math.pow(2, retryCount);
      const jitter = Math.random() * this.RETRY_JITTER_MAX;
      const delay = baseDelay + jitter;

      this.logger.warn(
        `Request failed, retrying in ${Math.round(delay)}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES + 1})`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      return this.executeWithRetry(requestFn, searchHash, retryCount + 1);
    }
  }

  /**
   * Health check for Amadeus API
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Try a simple token refresh to check API connectivity
      if (!this.isConfigured()) {
        return {
          status: 'error',
          details: 'Amadeus credentials not configured',
        };
      }

      const token = await this.getAccessToken();
      if (token) {
        const cacheStats = this.getCacheStats();
        const now = Date.now();
        const oneMinuteAgo = now - 60 * 1000;
        const requestsLastMinute = this.requestTimestamps.filter(
          (t) => t > oneMinuteAgo,
        ).length;

        return {
          status: 'healthy',
          details: {
            circuitState: this.circuitState,
            queueLength: this.requestQueue.length,
            pendingRequests: this.pendingRequests.size,
            cacheStats,
            lastRequestTime: this.lastRequestTime,
            rateLimitCooldown: this.rateLimitCooldown,
            consecutiveFailures: this.circuitFailureCount,
            rateLimiting: {
              requestsLastMinute,
              maxPerMinute: this.MAX_REQUESTS_PER_MINUTE,
              requestsLastHour: this.requestTimestamps.length,
              maxPerHour: this.MAX_REQUESTS_PER_HOUR,
            },
          },
        };
      } else {
        return { status: 'error', details: 'Failed to obtain access token' };
      }
    } catch (error) {
      return {
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process queued requests with rate limiting and circuit breaker
   */
  private async processRequestQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      // Check circuit breaker first
      if (!this.canMakeRequest()) {
        this.logger.warn(
          `Circuit breaker preventing request. State: ${this.circuitState}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      // Check rate limit cooldown
      if (Date.now() < this.rateLimitCooldown) {
        this.logger.warn(`Rate limit cooldown active, waiting...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // Enforce minimum interval between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest),
        );
      }

      const request = this.requestQueue.shift();
      if (request) {
        try {
          this.lastRequestTime = Date.now();
          this.recordRequest(); // Record timestamp for rate limiting
          await request();
        } catch (error) {
          this.logger.error('Error processing queued request:', error);
          // Record failure for circuit breaker
          this.recordFailure();
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Queue a request for rate-limited execution
   */
  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Start processing if not already running
      this.processRequestQueue();
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiry - 5000) {
      return this.cachedToken;
    }

    if (!this.isConfigured()) {
      throw new InternalServerErrorException(
        'Amadeus credentials are not configured',
      );
    }

    const body = new URLSearchParams();
    body.set('grant_type', 'client_credentials');
    body.set('client_id', this.clientId!);
    body.set('client_secret', this.clientSecret!);

    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    try {
      const response = await lastValueFrom(
        this.http.post<AmadeusAuthResponse>(
          `${this.host}/v1/security/oauth2/token`,
          body.toString(),
          config,
        ),
      );

      this.cachedToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.cachedToken;
    } catch (error) {
      this.logger.error(
        'Failed to fetch Amadeus token',
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        'Failed to authenticate with Amadeus',
      );
    }
  }

  async searchFlights(params: FlightSearchDto) {
    const searchHash = this.generateSearchHash(params);

    // Check cache first
    const cachedResult = this.getCachedResult(searchHash);
    if (cachedResult) {
      return cachedResult;
    }

    // Check for duplicate pending request
    const pendingRequest = this.pendingRequests.get(searchHash);
    if (pendingRequest) {
      this.logger.debug(
        `Deduplicating request: ${searchHash} - reusing pending request`,
      );
      return pendingRequest;
    }

    // Check circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn(
        `Circuit breaker blocking request. State: ${this.circuitState}`,
      );
      throw new AmadeusRateLimitError(
        'Amadeus API circuit breaker is open. Service temporarily unavailable.',
        Math.ceil((this.circuitNextAttemptTime - Date.now()) / 1000),
      );
    }

    // Check if we're in rate limit cooldown
    if (Date.now() < this.rateLimitCooldown) {
      this.logger.warn(
        `Rate limit cooldown active, using cached/fallback data`,
      );
      throw new AmadeusRateLimitError(
        'Amadeus API rate limit exceeded. Please try again later.',
        Math.ceil((this.rateLimitCooldown - Date.now()) / 1000),
      );
    }

    // Create and store the request promise for deduplication
    const requestPromise = this.queueRequest(async () => {
      const accessToken = await this.getAccessToken();

      const payload: any = {
        currencyCode: params.currencyCode ?? 'EUR',
        sources: ['GDS'],
        originDestinations: [],
        travelers: [
          {
            id: '1',
            travelerType: 'ADULT',
          },
        ],
        searchCriteria: {
          maxFlightOffers: params.max ?? 5,
        },
      };

      if (params.adults && params.adults > 1) {
        payload.travelers = Array.from({ length: params.adults }, (_, idx) => ({
          id: `${idx + 1}`,
          travelerType: 'ADULT',
        }));
      }

      payload.originDestinations.push({
        id: '1',
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDateTimeRange: {
          date: params.departureDate,
        },
      });

      if (params.returnDate) {
        payload.originDestinations.push({
          id: '2',
          originLocationCode: params.destinationLocationCode,
          destinationLocationCode: params.originLocationCode,
          departureDateTimeRange: {
            date: params.returnDate,
          },
        });
      }

      if (params.travelClass) {
        payload.searchCriteria.flightFilters = {
          cabinRestrictions: [
            {
              cabin: params.travelClass,
              coverage: 'MOST_SEGMENTS',
              originDestinationIds: payload.originDestinations.map(
                (od: any) => od.id,
              ),
            },
          ],
        };
      }

      if (params.maxPrice) {
        payload.searchCriteria.priceRange = {
          maxAmount: params.maxPrice,
        };
      }

      try {
        const response = await this.executeWithRetry(async () => {
          return lastValueFrom(
            this.http.post(`${this.host}/v2/shopping/flight-offers`, payload, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),
          );
        }, searchHash);

        // Record success for circuit breaker
        this.recordSuccess();

        // Cache successful result
        this.setCachedResult(searchHash, response.data, false);
        return response.data;
      } catch (error) {
        let isRateLimit = false;
        let retryAfter: number | undefined;

        if (error instanceof Error && 'response' in error) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 429) {
            isRateLimit = true;
            // Extract retry-after header if available
            const retryAfterHeader = axiosError.response.headers['retry-after'];
            if (retryAfterHeader) {
              retryAfter = parseInt(retryAfterHeader) * 1000; // Convert to milliseconds
            } else {
              retryAfter = 60 * 1000; // Default 1 minute
            }

            // Set rate limit cooldown - be more conservative
            const cooldownDuration = retryAfter || 5 * 60 * 1000; // Default 5 minutes if no retry-after header
            this.rateLimitCooldown = Date.now() + cooldownDuration;

            // Also increase circuit breaker timeout on rate limit
            this.circuitNextAttemptTime = Math.max(
              this.circuitNextAttemptTime,
              Date.now() + cooldownDuration,
            );

            this.logger.warn(
              `Amadeus rate limit exceeded (429). Cooldown set for ${retryAfter || 60000}ms.`,
            );
          } else if (axiosError.response?.status === 401) {
            // Token might be expired, clear cache
            this.cachedToken = null;
            this.tokenExpiry = 0;
            this.logger.warn(
              'Amadeus authentication failed, token cache cleared',
            );
          } else if (axiosError.response?.status === 500) {
            // Server error - cache this as error for shorter time
            this.setCachedResult(searchHash, null, true);
          }
        }

        // Record failure for circuit breaker
        this.recordFailure();

        if (isRateLimit) {
          throw new AmadeusRateLimitError(
            'Amadeus API rate limit exceeded. Please try again later.',
            retryAfter,
          );
        } else if (error?.response?.status === 500) {
          throw new AmadeusServerError(
            'Amadeus API server error. Please try again later.',
            30000, // 30 seconds
          );
        }

        this.logger.error(
          'Failed to fetch Amadeus flight offers',
          error instanceof Error ? error.stack : '',
        );
        throw new InternalServerErrorException('Unable to fetch flight offers');
      } finally {
        // Clean up pending request
        this.pendingRequests.delete(searchHash);
      }
    });

    // Store the promise for deduplication
    this.pendingRequests.set(searchHash, requestPromise);

    return requestPromise;
  }
}
