import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { RecalculatePointsService } from './recalculate-points.service';
import { PointsTransaction, PointsTransactionSchema } from './rewards.schema';
import { UserModule } from '../user/user.module';
import { Booking, BookingSchema } from '../booking/booking.schema';
import { Journey, JourneySchema } from '../journey/journey.schema';
import { Outfit, OutfitSchema } from '../outfit-weather/outfit.schema';
import {
  DiscussionComment,
  DiscussionCommentSchema,
} from '../discussion/discussion.schema';
import { Review, ReviewSchema } from '../reviews/reviews.schema';
import {
  OnboardingSession,
  OnboardingSessionSchema,
} from '../onboarding/onboarding.schema';
import { User, UserSchema } from '../user/user.schema';

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
    // Don't import other modules to avoid circular dependencies
    // They import RewardsModule, so we can't import them back
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RecalculatePointsService],
  exports: [RewardsService, RecalculatePointsService],
})
export class RewardsModule {}
