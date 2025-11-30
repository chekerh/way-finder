import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Booking, BookingDocument } from '../booking/booking.schema';
import { Journey, JourneyDocument } from '../journey/journey.schema';
import { Outfit, OutfitDocument } from '../outfit-weather/outfit.schema';
import { DiscussionComment, DiscussionCommentDocument } from '../discussion/discussion.schema';
import { Review, ReviewDocument } from '../reviews/reviews.schema';
import { OnboardingSession, OnboardingSessionDocument } from '../onboarding/onboarding.schema';
import { PointsTransaction, PointsTransactionDocument } from './rewards.schema';
import { RewardsService } from './rewards.service';
import { PointsSource } from './rewards.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { UserService } from '../user/user.service';

@Injectable()
export class RecalculatePointsService {
  private readonly logger = new Logger(RecalculatePointsService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Journey.name)
    private readonly journeyModel: Model<JourneyDocument>,
    @InjectModel(Outfit.name)
    private readonly outfitModel: Model<OutfitDocument>,
    @InjectModel(DiscussionComment.name)
    private readonly commentModel: Model<DiscussionCommentDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(OnboardingSession.name)
    private readonly onboardingModel: Model<OnboardingSessionDocument>,
    @InjectModel(PointsTransaction.name)
    private readonly pointsTransactionModel: Model<PointsTransactionDocument>,
    private readonly rewardsService: RewardsService,
    private readonly userService: UserService,
  ) {}

  /**
   * Recalculate points and lifetime metrics for all users based on their existing activities
   */
  async recalculateAllUsers(): Promise<{
    totalUsers: number;
    usersUpdated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let usersUpdated = 0;

    const users = await this.userModel.find({}).exec();
    this.logger.log(`Starting recalculation for ${users.length} users`);

    for (const user of users) {
      try {
        await this.recalculateUserPoints(user._id.toString());
        usersUpdated++;
      } catch (error) {
        const errorMsg = `Failed to recalculate for user ${user._id}: ${error.message}`;
        this.logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    this.logger.log(`Recalculation complete: ${usersUpdated}/${users.length} users updated`);
    return {
      totalUsers: users.length,
      usersUpdated,
      errors,
    };
  }

  /**
   * Recalculate points and lifetime metrics for a specific user
   */
  async recalculateUserPoints(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    this.logger.log(`Recalculating points for user ${userId} (${user.username})`);

    // Check if points have already been calculated (to avoid duplicates)
    const existingTransactions = await this.pointsTransactionModel
      .find({ user_id: new Types.ObjectId(userId) })
      .exec();

    // Calculate points from existing activities
    let totalPoints = 0;
    let lifetimePoints = 0;

    // 1. Onboarding completion (+100 points)
    const onboarding = await this.onboardingModel
      .findOne({ user_id: new Types.ObjectId(userId), completed: true })
      .exec();
    
    if (onboarding && !this.hasTransactionFor(existingTransactions, PointsSource.ONBOARDING)) {
      const points = this.rewardsService.getPointsForAction(PointsSource.ONBOARDING);
      await this.rewardsService.awardPoints({
        userId,
        points,
        source: PointsSource.ONBOARDING,
        description: 'Completed onboarding questionnaire (recalculated)',
        metadata: { recalculated: true },
      });
      totalPoints += points;
      lifetimePoints += points;
    }

    // 2. Confirmed bookings (+50 points each)
    const confirmedBookings = await this.bookingModel
      .find({
        user_id: new Types.ObjectId(userId),
        status: BookingStatus.CONFIRMED,
      })
      .exec();

    for (const booking of confirmedBookings) {
      if (!this.hasTransactionFor(existingTransactions, PointsSource.BOOKING, booking._id.toString())) {
        const points = this.rewardsService.getPointsForAction(PointsSource.BOOKING);
        await this.rewardsService.awardPoints({
          userId,
          points,
          source: PointsSource.BOOKING,
          description: 'Booked a flight (recalculated)',
          metadata: {
            booking_id: booking._id.toString(),
            recalculated: true,
          },
        });
        totalPoints += points;
        lifetimePoints += points;
      }
    }

    // 3. Shared journeys (+30 points each)
    const journeys = await this.journeyModel
      .find({
        user_id: new Types.ObjectId(userId),
        is_visible: true,
      })
      .exec();

    for (const journey of journeys) {
      if (!this.hasTransactionFor(existingTransactions, PointsSource.SHARE, journey._id.toString())) {
        const points = this.rewardsService.getPointsForAction(PointsSource.SHARE);
        await this.rewardsService.awardPoints({
          userId,
          points,
          source: PointsSource.SHARE,
          description: 'Shared a journey (recalculated)',
          metadata: {
            journey_id: journey._id.toString(),
            recalculated: true,
          },
        });
        totalPoints += points;
        lifetimePoints += points;
      }
    }

    // 4. Analyzed outfits (+20 points each)
    const outfits = await this.outfitModel
      .find({
        user_id: new Types.ObjectId(userId),
      })
      .exec();

    for (const outfit of outfits) {
      if (!this.hasTransactionFor(existingTransactions, PointsSource.OUTFIT, outfit._id.toString())) {
        const points = this.rewardsService.getPointsForAction(PointsSource.OUTFIT);
        await this.rewardsService.awardPoints({
          userId,
          points,
          source: PointsSource.OUTFIT,
          description: 'Analyzed an outfit (recalculated)',
          metadata: {
            outfit_id: outfit._id.toString(),
            recalculated: true,
          },
        });
        totalPoints += points;
        lifetimePoints += points;
      }
    }

    // 5. Comments (+10 points each)
    const comments = await this.commentModel
      .find({
        user_id: new Types.ObjectId(userId),
      })
      .exec();

    for (const comment of comments) {
      if (!this.hasTransactionFor(existingTransactions, PointsSource.COMMENT, comment._id.toString())) {
        const points = this.rewardsService.getPointsForAction(PointsSource.COMMENT);
        await this.rewardsService.awardPoints({
          userId,
          points,
          source: PointsSource.COMMENT,
          description: 'Published a comment (recalculated)',
          metadata: {
            comment_id: comment._id.toString(),
            recalculated: true,
          },
        });
        totalPoints += points;
        lifetimePoints += points;
      }
    }

    // 6. Destination reviews (+15 points each)
    const destinationReviews = await this.reviewModel
      .find({
        userId: new Types.ObjectId(userId),
        itemType: 'destination',
      })
      .exec();

    for (const review of destinationReviews) {
      if (!this.hasTransactionFor(existingTransactions, PointsSource.RATING, review._id.toString())) {
        const points = this.rewardsService.getPointsForAction(PointsSource.RATING);
        await this.rewardsService.awardPoints({
          userId,
          points,
          source: PointsSource.RATING,
          description: 'Rated a destination (recalculated)',
          metadata: {
            review_id: review._id.toString(),
            recalculated: true,
          },
        });
        totalPoints += points;
        lifetimePoints += points;
      }
    }

    // Update lifetime metrics using UserService
    await this.userService.incrementLifetimeMetric(userId, 'total_bookings', confirmedBookings.length);
    await this.userService.incrementLifetimeMetric(userId, 'total_outfits_analyzed', outfits.length);
    await this.userService.incrementLifetimeMetric(userId, 'total_posts_shared', journeys.length);
    
    // Calculate unique destinations from bookings
    const uniqueDestinations = new Set(
      confirmedBookings
        .map((b) => b.trip_details?.destination)
        .filter((d) => d),
    );
    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        total_destinations: uniqueDestinations.size,
      },
    });

    this.logger.log(
      `Recalculated ${totalPoints} points for user ${userId} (${user.username})`,
    );
  }

  /**
   * Check if a transaction already exists for a given source and optional metadata
   */
  private hasTransactionFor(
    transactions: PointsTransactionDocument[],
    source: PointsSource,
    metadataId?: string,
  ): boolean {
    if (metadataId) {
      return transactions.some(
        (t) =>
          t.source === source &&
          (t.metadata?.booking_id === metadataId ||
            t.metadata?.journey_id === metadataId ||
            t.metadata?.outfit_id === metadataId ||
            t.metadata?.comment_id === metadataId ||
            t.metadata?.review_id === metadataId),
      );
    }
    return transactions.some((t) => t.source === source);
  }
}

