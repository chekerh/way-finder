import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { AmadeusService, AmadeusRateLimitError } from './amadeus.service';
import { ActivitiesService } from './activities.service';
import type { ActivityFeedResponse } from './activities.service';
import { FlightSearchDto, RecommendedQueryDto } from './dto/flight-search.dto';
import { ExploreSearchDto } from './dto/explore-search.dto';
import { ActivitySearchDto } from './dto/activity-search.dto';
import { UserService } from '../user/user.service';
import { CacheService } from '../common/cache/cache.service';
import {
  FALLBACK_EXPLORE_OFFERS,
  FALLBACK_FLIGHT_OFFERS,
  DESTINATION_DESCRIPTIONS,
} from './catalog.fallback';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);
  private amadeusCooldownUntil = 0;

  constructor(
    private readonly amadeus: AmadeusService,
    private readonly activities: ActivitiesService,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  async getRecommendedFlights(userId: string, overrides: RecommendedQueryDto) {
    // Generate cache key based on user and search parameters
    const cacheKey = this.generateCacheKey('recommended', userId, overrides);

    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for recommended flights: ${cacheKey}`);
      return cachedResult;
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const preferences = (user as any)?.onboarding_preferences ?? {};
    const origin =
      overrides.originLocationCode ??
      preferences.home_airport ??
      preferences.origin ??
      'TUN';

    // If a specific destination is requested, use it
    if (overrides.destinationLocationCode) {
      const search: FlightSearchDto = {
        originLocationCode: origin,
        destinationLocationCode: overrides.destinationLocationCode,
        departureDate: overrides.departureDate ?? this.generateDateString(14),
        returnDate: overrides.returnDate ?? this.generateDateString(21),
        travelClass:
          overrides.travelClass ?? this.mapTravelClass(preferences.travel_type),
        adults: overrides.adults ?? 1,
        currencyCode: overrides.currencyCode ?? preferences.currency ?? 'EUR',
        max: overrides.maxResults ?? 5,
        maxPrice: overrides.maxPrice ?? preferences.budget_cap,
      };

      try {
        const result = await this.amadeus.searchFlights(search);
        // Ajouter les descriptions aux offres de vol
        if (result?.data?.length) {
          const enrichedData = result.data.map((offer: any) => {
            const destinationCode =
              offer.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode;
            if (destinationCode && DESTINATION_DESCRIPTIONS[destinationCode]) {
              return {
                ...offer,
                description: DESTINATION_DESCRIPTIONS[destinationCode],
              };
            }
            return offer;
          });
          const enrichedResult = { ...result, data: enrichedData };
          // Cache for 5 minutes
          try {
            await this.cacheService.set(cacheKey, enrichedResult, 300);
          } catch (error) {
            // Cache failures shouldn't break the response
            this.logger.warn(`Failed to cache enriched result: ${error}`);
          }
          return enrichedResult;
        }
        // Cache empty result for shorter time (2 minutes)
        try {
          await this.cacheService.set(cacheKey, result, 120);
        } catch (error) {
          // Cache failures shouldn't break the response
          this.logger.warn(`Failed to cache empty result: ${error}`);
        }
        return result;
      } catch (error) {
        if (error instanceof AmadeusRateLimitError) {
          this.registerAmadeusRateLimit();
        } else {
          this.registerAmadeusFailure();
        }
        const fallbackResult = this.buildFallbackFlightResponse(
          [overrides.destinationLocationCode],
          overrides.maxResults ?? 5,
        );
        // Cache fallback for shorter time (2 minutes)
        try {
          await this.cacheService.set(cacheKey, fallbackResult, 120);
        } catch (error) {
          // Cache failures shouldn't break the response
          this.logger.warn(`Failed to cache fallback result: ${error}`);
        }
        return fallbackResult;
      }
    }

    // Otherwise, search for multiple popular destinations to provide variety
    // Always include diverse destinations to avoid showing only one city
    // Include destinations from different regions: Europe, Asia, Americas
    const defaultDestinations = [
      'CDG',
      'FCO',
      'BCN',
      'DXB',
      'JFK',
      'LHR',
      'MAD',
      'AMS',
      'ATH',
      'IST',
      'NRT',
      'BKK',
      'SIN',
      'ICN',
    ];
    const popularDestinations =
      preferences.destination_preferences?.length > 0
        ? [
            ...preferences.destination_preferences,
            ...defaultDestinations,
          ].slice(0, 10) // Mix preferences with defaults
        : defaultDestinations;

    const allFlights: any[] = [];
    const totalRequested = overrides.maxResults ?? 15;
    // Increase number of destinations to search for more variety
    const numDestinations = Math.min(5, popularDestinations.length); // Search up to 5 different destinations
    const maxPerDestination = Math.max(
      2,
      Math.floor(totalRequested / numDestinations),
    );

    if (this.shouldUseFallbackFlights()) {
      const fallbackResult = this.buildFallbackFlightResponse(
        popularDestinations,
        totalRequested,
      );
      // Cache fallback for shorter time (2 minutes)
      try {
        await this.cacheService.set(cacheKey, fallbackResult, 120);
      } catch (error) {
        // Cache failures shouldn't break the response
        this.logger.warn(`Failed to cache fallback result: ${error}`);
      }
      return fallbackResult;
    }

    let hadSuccessfulExternalCall = false;

    const searchPromises = popularDestinations
      .slice(0, numDestinations)
      .map(async (dest) => {
        try {
          const search: FlightSearchDto = {
            originLocationCode: origin,
            destinationLocationCode: dest,
            departureDate:
              overrides.departureDate ?? this.generateDateString(14),
            returnDate: overrides.returnDate ?? this.generateDateString(21),
            travelClass:
              overrides.travelClass ??
              this.mapTravelClass(preferences.travel_type),
            adults: overrides.adults ?? 1,
            currencyCode:
              overrides.currencyCode ?? preferences.currency ?? 'EUR',
            max: maxPerDestination,
            maxPrice: overrides.maxPrice ?? preferences.budget_cap,
          };

          const result = await this.amadeus.searchFlights(search);
          if (result?.data?.length) {
            hadSuccessfulExternalCall = true;
            // Ajouter les descriptions aux offres de vol
            return result.data.map((offer: any) => {
              // Extraire le code d'aéroport de destination depuis les segments
              const destinationCode =
                offer.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode;
              if (
                destinationCode &&
                DESTINATION_DESCRIPTIONS[destinationCode]
              ) {
                return {
                  ...offer,
                  description: DESTINATION_DESCRIPTIONS[destinationCode],
                };
              }
              return offer;
            });
          }
          return [];
        } catch (error) {
          if (error instanceof AmadeusRateLimitError) {
            this.registerAmadeusRateLimit();
          } else {
            this.registerAmadeusFailure();
          }
          return [];
        }
      });

    const results = await Promise.all(searchPromises);
    results.forEach((flights) => {
      if (flights.length > 0) {
        allFlights.push(...flights);
      }
    });

    if (!allFlights.length) {
      const fallbackResult = this.buildFallbackFlightResponse(
        popularDestinations,
        totalRequested,
      );
      // Cache fallback for shorter time (2 minutes)
      try {
        await this.cacheService.set(cacheKey, fallbackResult, 120);
      } catch (error) {
        // Cache failures shouldn't break the response
        this.logger.warn(`Failed to cache fallback result: ${error}`);
      }
      return fallbackResult;
    }

    if (hadSuccessfulExternalCall) {
      this.registerAmadeusSuccess();
    }

    const result = { data: allFlights.slice(0, totalRequested), meta: {} };

    // Cache the result for 5 minutes (300 seconds)
    try {
      await this.cacheService.set(cacheKey, result, 300);
      this.logger.debug(`Cached recommended flights: ${cacheKey}`);
    } catch (error) {
      // Cache failures shouldn't break the response
      this.logger.warn(`Failed to cache recommended flights: ${error}`);
    }

    return result;
  }

  async getExploreOffers(params: ExploreSearchDto) {
    // Generate cache key for explore offers
    const cacheKey = this.generateCacheKey('explore', null, params);

    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for explore offers: ${cacheKey}`);
      return cachedResult;
    }

    const origin = (params.origin ?? 'TUN').toUpperCase();
    const max = params.limit ?? 10;
    const budget = params.budget;
    const destination = params.destination?.toUpperCase();

    let offers = FALLBACK_EXPLORE_OFFERS.filter(
      (offer) => offer.flyFrom === origin,
    );

    if (destination) {
      offers = offers.filter((offer) => offer.flyTo === destination);
    }

    if (typeof budget === 'number') {
      offers = offers.filter((offer) => offer.price <= budget);
    }

    if (!offers.length) {
      offers = FALLBACK_EXPLORE_OFFERS;
    }

    const result = {
      data: offers.slice(0, max),
      currency: 'EUR',
      source: 'fallback',
    };

    // Cache for 10 minutes (600 seconds)
    try {
      await this.cacheService.set(cacheKey, result, 600);
      this.logger.debug(`Cached explore offers: ${cacheKey}`);
    } catch (error) {
      // Cache failures shouldn't break the response
      this.logger.warn(`Failed to cache explore offers: ${error}`);
    }

    return result;
  }

  async getActivitiesFeed(
    params: ActivitySearchDto,
  ): Promise<ActivityFeedResponse> {
    return this.activities.findActivities(params);
  }

  private generateDateString(offsetDays: number): string {
    const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }

  private mapTravelClass(travelType?: string) {
    switch (travelType) {
      case 'business':
        return 'BUSINESS';
      case 'luxury':
        return 'FIRST';
      case 'premium':
        return 'PREMIUM_ECONOMY';
      default:
        return 'ECONOMY';
    }
  }

  private shouldUseFallbackFlights(): boolean {
    return (
      !this.amadeus.isConfigured() || Date.now() < this.amadeusCooldownUntil
    );
  }

  private registerAmadeusFailure() {
    // Regular failure: 5 minute cooldown
    this.amadeusCooldownUntil = Date.now() + 5 * 60 * 1000;
  }

  private registerAmadeusRateLimit() {
    // Rate limit (429): 30 minute cooldown to avoid hitting limits again
    this.amadeusCooldownUntil = Date.now() + 30 * 60 * 1000;
  }

  private registerAmadeusSuccess() {
    this.amadeusCooldownUntil = 0;
  }

  /**
   * Generate cache key for catalog endpoints
   * @param type - Cache type (recommended, explore, activities)
   * @param userId - Optional user ID
   * @param params - Search parameters
   * @returns Cache key string
   */
  private generateCacheKey(
    type: string,
    userId: string | null,
    params: any,
  ): string {
    const paramsHash = JSON.stringify(params).replace(/\s+/g, '').slice(0, 100); // Limit hash length
    const userPart = userId ? `:${userId}` : '';
    return `catalog:${type}${userPart}:${paramsHash}`;
  }

  private buildFallbackFlightResponse(
    preferredDestinations: string[],
    maxResults?: number,
  ) {
    const normalizedPrefs = preferredDestinations.map((code) =>
      code.toUpperCase(),
    );

    // First, try to get flights matching preferences
    let flights = FALLBACK_FLIGHT_OFFERS.filter((flight) =>
      normalizedPrefs.includes(flight.destinationCode),
    );

    // If we don't have enough variety, add more destinations from fallback
    // Ensure we always have at least 3-5 different destinations
    const uniqueDestinations = flights
      .map((f) => f.destinationCode)
      .filter((v, i, a) => a.indexOf(v) === i);
    const minDestinations = Math.min(5, FALLBACK_FLIGHT_OFFERS.length);

    if (uniqueDestinations.length < minDestinations) {
      // Add more destinations from fallback to ensure variety
      const additionalFlights = FALLBACK_FLIGHT_OFFERS.filter(
        (flight) => !uniqueDestinations.includes(flight.destinationCode),
      );
      flights = [...flights, ...additionalFlights].slice(
        0,
        minDestinations * 2,
      ); // Take up to 2 per destination
    }

    if (!flights.length) {
      flights = FALLBACK_FLIGHT_OFFERS;
    }

    // Ensure we return diverse destinations (at least one per unique destination code)
    const diverseFlights: typeof FALLBACK_FLIGHT_OFFERS = [];
    const seenDestinations = new Set<string>();

    // First pass: one flight per destination
    for (const flight of flights) {
      if (!seenDestinations.has(flight.destinationCode)) {
        diverseFlights.push(flight);
        seenDestinations.add(flight.destinationCode);
      }
    }

    // Second pass: add more flights from same destinations if we have space
    for (const flight of flights) {
      if (diverseFlights.length >= (maxResults ?? 15)) break;
      if (
        seenDestinations.has(flight.destinationCode) &&
        diverseFlights.filter(
          (f) => f.destinationCode === flight.destinationCode,
        ).length < 2
      ) {
        diverseFlights.push(flight);
      }
    }

    const slice = diverseFlights.slice(0, maxResults ?? diverseFlights.length);

    return {
      data: slice.map((flight) => {
        const offer = { ...flight.offer };
        // Ajouter la description basée sur le code de destination
        const description = DESTINATION_DESCRIPTIONS[flight.destinationCode];
        if (description) {
          offer.description = description;
        }
        return offer;
      }),
      meta: { fallback: true },
    };
  }
}
