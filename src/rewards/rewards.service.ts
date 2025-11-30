import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PointsTransaction, PointsTransactionDocument } from './rewards.schema';
import { User, UserDocument } from '../user/user.schema';
import { AwardPointsDto, PointsSource, PointsType } from './rewards.dto';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    @InjectModel(PointsTransaction.name)
    private readonly pointsTransactionModel: Model<PointsTransactionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Award points to a user
   */
  async awardPoints(dto: AwardPointsDto): Promise<{
    transaction_id: string;
    total_points: number;
    points_awarded: number;
  }> {
    const userId = new Types.ObjectId(dto.userId);

    // Create transaction
    const transaction = new this.pointsTransactionModel({
      user_id: userId,
      points: dto.points,
      type: PointsType.EARNED,
      source: dto.source,
      description: dto.description || this.getDefaultDescription(dto.source),
      metadata: dto.metadata || {},
      transaction_date: new Date(),
    });

    await transaction.save();

    // Update user's total points
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentPoints = user.total_points || 0;
    const newTotalPoints = currentPoints + dto.points;

    await this.userModel.findByIdAndUpdate(userId, {
      $set: { total_points: newTotalPoints },
      $inc: { lifetime_points: dto.points }, // Track lifetime points
    });

    this.logger.log(
      `Awarded ${dto.points} points to user ${dto.userId} from ${dto.source}. New total: ${newTotalPoints}`,
    );

    return {
      transaction_id: transaction._id.toString(),
      total_points: newTotalPoints,
      points_awarded: dto.points,
    };
  }

  /**
   * Get user's points summary
   */
  async getUserPoints(userId: string): Promise<{
    total_points: number;
    available_points: number;
    lifetime_points: number;
    recent_transactions: any[];
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const recentTransactions = await this.pointsTransactionModel
      .find({ user_id: new Types.ObjectId(userId) })
      .sort({ transaction_date: -1 })
      .limit(10)
      .lean();

    return {
      total_points: user.total_points || 0,
      available_points: user.total_points || 0, // Same for now, can add reserved points later
      lifetime_points: user.lifetime_points || 0,
      recent_transactions: recentTransactions.map((t) => ({
        transaction_id: t._id.toString(),
        user_id: t.user_id.toString(),
        points: t.points,
        type: t.type,
        source: t.source,
        description: t.description,
        transaction_date: t.transaction_date,
      })),
    };
  }

  /**
   * Redeem points (for future use - discounts, perks, etc.)
   */
  async redeemPoints(
    userId: string,
    points: number,
    description: string,
    metadata?: Record<string, any>,
  ): Promise<{
    transaction_id: string;
    remaining_points: number;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentPoints = user.total_points || 0;
    if (currentPoints < points) {
      throw new Error('Insufficient points');
    }

    const transaction = new this.pointsTransactionModel({
      user_id: new Types.ObjectId(userId),
      points: -points, // Negative for redemption
      type: PointsType.REDEEMED,
      source: PointsSource.BONUS,
      description,
      metadata: metadata || {},
      transaction_date: new Date(),
    });

    await transaction.save();

    const remainingPoints = currentPoints - points;
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { total_points: remainingPoints },
    });

    return {
      transaction_id: transaction._id.toString(),
      remaining_points: remainingPoints,
    };
  }

  /**
   * Get default description for point source
   */
  private getDefaultDescription(source: PointsSource): string {
    const descriptions: Record<PointsSource, string> = {
      [PointsSource.ONBOARDING]: 'Completed onboarding questionnaire',
      [PointsSource.BOOKING]: 'Booked a trip',
      [PointsSource.REVIEW]: 'Wrote a review',
      [PointsSource.SHARE]: 'Shared a journey',
      [PointsSource.STREAK]: 'Maintained daily streak',
      [PointsSource.ACHIEVEMENT]: 'Unlocked achievement',
      [PointsSource.REFERRAL]: 'Referred a friend',
      [PointsSource.BONUS]: 'Bonus points',
      [PointsSource.OUTFIT]: 'Analyzed an outfit',
      [PointsSource.COMMENT]: 'Published a comment',
      [PointsSource.RATING]: 'Rated a destination',
      [PointsSource.FILTERS]: 'Used advanced filters',
    };
    return descriptions[source] || 'Points awarded';
  }

  /**
   * Calculate points for different actions
   */
  getPointsForAction(
    source: PointsSource,
    metadata?: Record<string, any>,
  ): number {
    const pointsMap: Record<PointsSource, number> = {
      [PointsSource.ONBOARDING]: 100, // Complete onboarding
      [PointsSource.BOOKING]: 50, // Book a flight
      [PointsSource.REVIEW]: 15, // Rate a destination (updated from 25)
      [PointsSource.SHARE]: 30, // Share a journey
      [PointsSource.STREAK]: 10, // Daily streak bonus
      [PointsSource.ACHIEVEMENT]: 50, // Per achievement
      [PointsSource.REFERRAL]: 100, // Per referral
      [PointsSource.BONUS]: metadata?.points || 0, // Custom bonus
      [PointsSource.OUTFIT]: 20, // Analyze an outfit
      [PointsSource.COMMENT]: 10, // Publish a comment
      [PointsSource.RATING]: 15, // Rate a destination (same as review)
      [PointsSource.FILTERS]: 5, // Use advanced filters
    };

    // Special cases
    if (source === PointsSource.BOOKING && metadata?.amount) {
      // Bonus points based on booking amount (1 point per $10)
      const amountBonus = Math.floor(metadata.amount / 10);
      return pointsMap[source] + amountBonus;
    }

    if (source === PointsSource.STREAK && metadata?.streakDays) {
      // Bonus for longer streaks
      const streakBonus = Math.min(metadata.streakDays * 2, 50);
      return pointsMap[source] + streakBonus;
    }

    return pointsMap[source] || 0;
  }
}
