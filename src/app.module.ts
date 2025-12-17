import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/wayfindr'),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    UserModule,
    AuthModule,
    BookingModule,
    PaymentModule,
    OnboardingModule,
    RecommendationsModule,
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

