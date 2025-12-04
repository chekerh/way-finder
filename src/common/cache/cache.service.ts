import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';

/**
 * Cache Service
 * Provides Redis-based caching functionality with TTL support
 * Gracefully handles Redis unavailability (falls back to no caching)
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null = null;
  private isEnabled = false;

  constructor() {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect to Redis
   * Gracefully handles connection failures
   */
  private async connect(): Promise<void> {
    try {
      const redisOptions = this.getRedisOptions();

      // Skip Redis if explicitly disabled or no Redis URL/host configured
      if (process.env.DISABLE_REDIS_CACHE === 'true') {
        this.logger.warn(
          'Redis cache is disabled via DISABLE_REDIS_CACHE environment variable',
        );
        return;
      }

      this.redisClient = new Redis(redisOptions);

      this.redisClient.on('connect', () => {
        this.logger.log('✅ Redis cache connected');
        this.isEnabled = true;
      });

      this.redisClient.on('error', (error) => {
        this.logger.warn(
          `Redis cache error: ${error.message}. Caching disabled.`,
        );
        this.isEnabled = false;
      });

      this.redisClient.on('close', () => {
        this.logger.warn('Redis cache connection closed');
        this.isEnabled = false;
      });

      // Try to connect
      await this.redisClient.connect();
    } catch (error: any) {
      this.logger.warn(
        `Failed to connect to Redis cache: ${error.message}. Caching will be disabled.`,
      );
      this.isEnabled = false;
      this.redisClient = null;
    }
  }

  /**
   * Disconnect from Redis
   */
  private async disconnect(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
      this.isEnabled = false;
    }
  }

  /**
   * Get Redis connection options
   * Reuses configuration from app.module.ts
   */
  private getRedisOptions(): RedisOptions {
    const sharedOptions: Partial<RedisOptions> = {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10_000,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 5_000);
        return delay;
      },
    };

    const shouldUseTls = process.env.REDIS_TLS === 'true';
    const tlsOptions = shouldUseTls
      ? {
          tls: {
            rejectUnauthorized:
              process.env.REDIS_TLS_REJECT_UNAUTHORIZED === 'false'
                ? false
                : true,
          },
        }
      : undefined;

    const urlFromEnv =
      process.env.REDIS_URL ||
      process.env.UPSTASH_REDIS_URL ||
      process.env.REDISS_URL;

    if (urlFromEnv) {
      try {
        const url = new URL(urlFromEnv);
        const usesTls = url.protocol === 'rediss:';
        return {
          host: url.hostname,
          port: Number(url.port || '6379'),
          password: url.password || undefined,
          ...(usesTls
            ? {
                tls: {
                  rejectUnauthorized:
                    process.env.REDIS_TLS_REJECT_UNAUTHORIZED === 'false'
                      ? false
                      : true,
                },
              }
            : tlsOptions),
          ...sharedOptions,
        } as RedisOptions;
      } catch (error: any) {
        this.logger.warn(
          `Invalid Redis URL provided: ${error.message}. Falling back to host/port configuration.`,
        );
      }
    }

    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      ...(tlsOptions || {}),
      ...sharedOptions,
    } as RedisOptions;
  }

  /**
   * Get cached value by key
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redisClient) {
      return null;
    }

    try {
      const value = await this.redisClient.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error: any) {
      this.logger.warn(`Cache get error for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Set cached value with optional TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.setex(key, ttlSeconds, stringValue);
      } else {
        await this.redisClient.set(key, stringValue);
      }
    } catch (error: any) {
      this.logger.warn(`Cache set error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete cached value by key
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      await this.redisClient.del(key);
    } catch (error: any) {
      this.logger.warn(`Cache delete error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete multiple cached values by pattern
   * @param pattern - Cache key pattern (e.g., 'catalog:*')
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        this.logger.debug(
          `Deleted ${keys.length} cache keys matching pattern: ${pattern}`,
        );
      }
    } catch (error: any) {
      this.logger.warn(
        `Cache delete pattern error for ${pattern}: ${error.message}`,
      );
    }
  }

  /**
   * Clear all cached values (use with caution)
   */
  async clear(): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      await this.redisClient.flushdb();
      this.logger.warn('Redis cache cleared (flushdb)');
    } catch (error: any) {
      this.logger.warn(`Cache clear error: ${error.message}`);
    }
  }

  /**
   * Check if caching is enabled and Redis is connected
   */
  isCacheEnabled(): boolean {
    return this.isEnabled && this.redisClient !== null;
  }
}
