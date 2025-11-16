import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingSession, OnboardingSessionSchema } from './onboarding.schema';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingAIService } from './ai/onboarding-ai.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OnboardingSession.name, schema: OnboardingSessionSchema }]),
    UserModule,
    HttpModule.register({
      timeout: 35000,
      maxRedirects: 5,
    }),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingAIService],
  exports: [OnboardingService],
})
export class OnboardingModule {}

