import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { RecalculatePointsService } from './recalculate-points.service';
import { PointsTransaction, PointsTransactionSchema } from './rewards.schema';
import { UserModule } from '../user/user.module';
import { BookingModule } from '../booking/booking.module';
import { JourneyModule } from '../journey/journey.module';
import { OutfitWeatherModule } from '../outfit-weather/outfit-weather.module';
import { DiscussionModule } from '../discussion/discussion.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { Booking, BookingSchema } from '../booking/booking.schema';
import { Journey, JourneySchema } from '../journey/journey.schema';
import { Outfit, OutfitSchema } from '../outfit-weather/outfit.schema';
import { DiscussionComment, DiscussionCommentSchema } from '../discussion/discussion.schema';
import { Review, ReviewSchema } from '../reviews/reviews.schema';
import { OnboardingSession, OnboardingSessionSchema } from '../onboarding/onboarding.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PointsTransaction.name, schema: PointsTransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Journey.name, schema: JourneySchema },
      { name: Outfit.name, schema: OutfitSchema },
      { name: DiscussionComment.name, schema: DiscussionCommentSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: OnboardingSession.name, schema: OnboardingSessionSchema },
    ]),
    UserModule,
    BookingModule,
    JourneyModule,
    OutfitWeatherModule,
    DiscussionModule,
    ReviewsModule,
    OnboardingModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RecalculatePointsService],
  exports: [RewardsService, RecalculatePointsService],
})
export class RewardsModule {}
