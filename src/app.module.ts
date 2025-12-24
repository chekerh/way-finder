import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import type { RedisOptions } from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { VideoGenerationModule } from './video-generation/video-generation.module';
import { RealTimeGateway } from './real-time/real-time.gateway';
import { CatalogModule } from './catalog/catalog.module';
import { DiscussionModule } from './discussion/discussion.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SocialModule } from './social/social.module';
import { SearchHistoryModule } from './search-history/search-history.module';
import { PriceAlertsModule } from './price-alerts/price-alerts.module';
import { TravelTipsModule } from './travel-tips/travel-tips.module';
import { JourneyModule } from './journey/journey.module';
import { VideoProcessingModule } from './video-processing/video-processing.module';
import { DestinationVideoModule } from './video-generation/destination-video.module';
import { ChatModule } from './chat/chat.module';
import { RewardsModule } from './rewards/rewards.module';
import { OutfitWeatherModule } from './outfit-weather/outfit-weather.module';
import { CacheModule } from './common/cache/cache.module';
import { CommissionModule } from './commission/commission.module';
import { UpsellsModule } from './upsells/upsells.module';

/**
 * Constructs MongoDB connection URI from environment variables.
 * Falls back to localhost for development if not set.
 */
const mongoUri = (() => {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.VERCEL) {
      throw new Error(
        'MONGODB_URI environment variable is not set. Please configure it in Vercel project settings.',
      );
    }
    return 'mongodb://localhost:27017/wayfindr';
  }

  // Remove deprecated options from connection string
  // bufferMaxEntries is deprecated and not supported in newer MongoDB drivers
  uri = uri.replace(/[?&]bufferMaxEntries=[^&]*/gi, '');
  uri = uri.replace(/[?&]buffermaxentries=[^&]*/gi, '');

  return uri;
})();

/**
 * MongoDB connection options optimized for production (Render hosting).
 * These settings balance performance, resource usage, and connection limits.
 *
 * Connection Pool Settings:
 * - maxPoolSize: Maximum number of connections in the pool (50 for production, 10 for dev)
 * - minPoolSize: Minimum number of connections maintained (5 for production, 1 for dev)
 * - maxIdleTimeMS: Close idle connections after 30 seconds
 * - serverSelectionTimeoutMS: Timeout for server selection (10 seconds)
 * - socketTimeoutMS: Timeout for socket operations (45 seconds)
 * - connectTimeoutMS: Timeout for initial connection (10 seconds)
 * - heartbeatFrequencyMS: Frequency of heartbeat checks (10 seconds)
 *
 * Performance Settings:
 * - bufferCommands: Disable Mongoose buffering (use connection pooling instead)
 * Note: bufferMaxEntries is deprecated and not supported - removed from options
 */
const getMongoConnectionOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = process.env.RENDER === 'true';

  return {
    // Connection pool settings - optimized for Render hosting
    maxPoolSize: isProduction ? (isRender ? 50 : 30) : 10, // More connections for Render
    minPoolSize: isProduction ? (isRender ? 5 : 3) : 1, // Maintain minimum connections
    maxIdleTimeMS: 30000, // Close idle connections after 30 seconds

    // Timeout settings
    serverSelectionTimeoutMS: 10000, // 10 seconds to select server
    socketTimeoutMS: 45000, // 45 seconds socket timeout
    connectTimeoutMS: 10000, // 10 seconds connection timeout
    heartbeatFrequencyMS: 10000, // Heartbeat every 10 seconds

    // Performance optimizations
    bufferCommands: false, // Disable Mongoose buffering (use connection pool)
    // Note: bufferMaxEntries is deprecated and removed - not needed with connection pooling

    // Retry settings for production
    retryWrites: true, // Retry write operations on network errors
    retryReads: true, // Retry read operations on network errors

    // Compression (if supported by MongoDB server)
    compressors: ['zlib'] as 'zlib'[],

    // Monitoring and logging (useful for debugging)
    monitorCommands: process.env.NODE_ENV === 'development', // Log commands in dev only
  };
};

const createRedisOptions = (): RedisOptions => {
  const sharedOptions: Partial<RedisOptions> = {
    maxRetriesPerRequest: null, // Required by Bull for subscriber clients
    enableReadyCheck: false, // Avoid ready check for subscriber connections
    enableOfflineQueue: true, // Allow Bull to queue commands while Redis connects
    lazyConnect: true,
    connectTimeout: 10_000,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 5_000);
      if (times <= 3) {
        const logger = new Logger('RedisConnection');
        logger.warn(
          `Redis connection retry attempt ${times}, waiting ${delay}ms`,
        );
      }
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
      const logger = new Logger('AppModule');
      logger.warn(
        `Invalid Redis URL provided (${urlFromEnv}): ${error.message}. Falling back to host/port configuration.`,
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
};

@Module({
  imports: [
    // MongoDB connection with optimized connection pooling for Render hosting
    MongooseModule.forRoot(mongoUri, getMongoConnectionOptions()),
    BullModule.forRoot({
      redis: createRedisOptions(),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 120, // Global default: 120 requests per minute
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 10, // Strict limit: 10 requests per minute (for auth)
      },
      {
        name: 'payment',
        ttl: 60000,
        limit: 20, // Payment limit: 20 requests per minute
      },
      {
        name: 'catalog',
        ttl: 60000,
        limit: 30, // Catalog limit: 30 requests per minute
      },
    ]),
    CacheModule,
    UserModule,
    AuthModule,
    BookingModule,
    PaymentModule,
    OnboardingModule,
    RecommendationsModule,
    CatalogModule,
    DiscussionModule,
    FavoritesModule,
    ReviewsModule,
    ItineraryModule,
    NotificationsModule,
    SocialModule,
    SearchHistoryModule,
    PriceAlertsModule,
    TravelTipsModule,
    JourneyModule,
    VideoProcessingModule,
    DestinationVideoModule,
    ChatModule,
    OutfitWeatherModule,
    CommissionModule,
    UpsellsModule,
    VideoGenerationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RealTimeGateway,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
