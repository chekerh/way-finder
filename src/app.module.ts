import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
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

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 3, // Reduced from default 20 to fail faster
        retryStrategy: (times) => {
          // Exponential backoff with max delay of 5 seconds
          const delay = Math.min(times * 50, 5000);
          if (times <= 3) {
            console.warn(
              `Redis connection retry attempt ${times}, waiting ${delay}ms`,
            );
          }
          return delay;
        },
        enableReadyCheck: true,
        enableOfflineQueue: false, // Don't queue commands when offline
        lazyConnect: true, // Don't connect immediately
      },
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
