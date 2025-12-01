import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument, ReviewItemType } from './reviews.schema';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';
import { RewardsService } from '../rewards/rewards.service';
import { PointsSource } from '../rewards/rewards.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    private readonly rewardsService: RewardsService,
    private readonly userService: UserService,
  ) {}

  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    // Check if user already reviewed this item
    const existing = await this.reviewModel.findOne({
      userId,
      itemType: createReviewDto.itemType,
      itemId: createReviewDto.itemId,
    });

    if (existing) {
      throw new BadRequestException(
        'You have already reviewed this item. Use update instead.',
      );
    }

    const review = new this.reviewModel({
      userId,
      ...createReviewDto,
    });

    const savedReview = await review.save();
    
    // Award points for rating a destination (+15 points)
    // Only award for destination reviews to match the requirement
    if (createReviewDto.itemType === 'destination') {
      try {
        const points = this.rewardsService.getPointsForAction(PointsSource.RATING);
        await this.rewardsService.awardPoints({
          userId,
          points,
          source: PointsSource.RATING,
          description: 'Rated a destination',
          metadata: {
            review_id: savedReview._id.toString(),
            item_type: createReviewDto.itemType,
            item_id: createReviewDto.itemId,
            rating: createReviewDto.rating,
          },
        });
        this.logger.log(`Awarded ${points} points to user ${userId} for rating destination`);
      } catch (error) {
        this.logger.warn(`Failed to award points for review: ${error.message}`);
        // Don't fail review creation if points fail
      }
    }
    
    return this.reviewModel
      .findById(savedReview._id)
      .populate('userId', 'username first_name last_name profile_image_url')
      .exec() as any;
  }

  async updateReview(
    userId: string,
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewModel.findOne({ _id: reviewId, userId });

    if (!review) {
      throw new NotFoundException(
        'Review not found or you do not have permission to update it',
      );
    }

    Object.assign(review, updateReviewDto);
    const savedReview = await review.save();
    return this.reviewModel
      .findById(savedReview._id)
      .populate('userId', 'username first_name last_name profile_image_url')
      .exec() as any;
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const result = await this.reviewModel.deleteOne({ _id: reviewId, userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'Review not found or you do not have permission to delete it',
      );
    }
  }

  async getReviews(
    itemType: ReviewItemType,
    itemId: string,
  ): Promise<Review[]> {
    return this.reviewModel
      .find({ itemType, itemId, isVisible: true })
      .populate('userId', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserReviews(
    userId: string,
    itemType?: ReviewItemType,
  ): Promise<Review[]> {
    const query: any = { userId };
    if (itemType) {
      query.itemType = itemType;
    }
    return this.reviewModel
      .find(query)
      .populate('userId', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getReviewStats(
    itemType: ReviewItemType,
    itemId: string,
  ): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.reviewModel
      .find({ itemType, itemId, isVisible: true })
      .exec();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  async checkUserReview(
    userId: string,
    itemType: ReviewItemType,
    itemId: string,
  ): Promise<Review | null> {
    return this.reviewModel
      .findOne({ userId, itemType, itemId })
      .populate('userId', 'username first_name last_name profile_image_url')
      .exec();
  }
}
