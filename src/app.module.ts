import { Module } from '@nestjs/common';
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

const mongoUri = (() => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  if (process.env.VERCEL) {
    throw new Error(
      'MONGODB_URI environment variable is not set. Please configure it in Vercel project settings.',
    );
  }
  return 'mongodb://localhost:27017/wayfindr';
})();

const createRedisOptions = (): RedisOptions => {
  const sharedOptions: Partial<RedisOptions> = {
    maxRetriesPerRequest: null, // Required by Bull for subscriber clients
    enableReadyCheck: false, // Avoid ready check for subscriber connections
    enableOfflineQueue: false,
    lazyConnect: true,
    connectTimeout: 10_000,
        retryStrategy: (times) => {
      const delay = Math.min(times * 50, 5_000);
          if (times <= 3) {
            console.warn(
              `Redis connection retry attempt ${times}, waiting ${delay}ms`,
            );
          }
          return delay;
        },
  };

  const shouldUseTls = process.env.REDIS_TLS === 'true';
  const tlsOptions =
    shouldUseTls
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
    } catch (error) {
      console.warn(
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
    MongooseModule.forRoot(mongoUri),
    BullModule.forRoot({
      redis: createRedisOptions(),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
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
