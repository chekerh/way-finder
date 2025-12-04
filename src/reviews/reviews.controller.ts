import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';
import type { ReviewItemType } from './reviews.schema';
import {
  PaginationDto,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Reviews Controller
 * Handles reviews and ratings for destinations, hotels, activities, and other items
 */
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(
    @Req() req: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.createReview(
      req.user.sub,
      createReviewDto,
    );
    const reviewObj = (review as any).toObject
      ? (review as any).toObject()
      : review;
    return reviewObj;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateReview(
    @Req() req: any,
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.reviewsService.updateReview(
      req.user.sub,
      reviewId,
      updateReviewDto,
    );
    const reviewObj = (review as any).toObject
      ? (review as any).toObject()
      : review;
    return reviewObj;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReview(@Req() req: any, @Param('id') reviewId: string) {
    await this.reviewsService.deleteReview(req.user.sub, reviewId);
    return { message: 'Review deleted successfully' };
  }

  /**
   * Get reviews for an item with pagination
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @Get(':itemType/:itemId')
  async getReviews(
    @Param('itemType') itemType: ReviewItemType,
    @Param('itemId') itemId: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = pagination || {};
    const result = await this.reviewsService.getReviewsPaginated(
      itemType,
      itemId,
      page,
      limit,
    );

    const data = result.data.map((review) => {
      const reviewObj = (review as any).toObject
        ? (review as any).toObject()
        : review;
      return reviewObj;
    });

    return createPaginatedResponse(data, result.total, page, limit);
  }

  @Get(':itemType/:itemId/stats')
  async getReviewStats(
    @Param('itemType') itemType: ReviewItemType,
    @Param('itemId') itemId: string,
  ) {
    return this.reviewsService.getReviewStats(itemType, itemId);
  }

  /**
   * Get user's reviews with pagination
   * @query type - Optional filter by item type
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/my-reviews')
  async getUserReviews(
    @Req() req: any,
    @Query('type') itemType?: ReviewItemType,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = pagination || {};
    const result = await this.reviewsService.getUserReviewsPaginated(
      req.user.sub,
      page,
      limit,
      itemType,
    );

    const data = result.data.map((review) => {
      const reviewObj = (review as any).toObject
        ? (review as any).toObject()
        : review;
      return reviewObj;
    });

    return createPaginatedResponse(data, result.total, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:itemType/:itemId')
  async checkUserReview(
    @Req() req: any,
    @Param('itemType') itemType: ReviewItemType,
    @Param('itemId') itemId: string,
  ) {
    const review = await this.reviewsService.checkUserReview(
      req.user.sub,
      itemType,
      itemId,
    );
    if (!review) {
      return null;
    }
    const reviewObj = (review as any).toObject
      ? (review as any).toObject()
      : review;
    return reviewObj;
  }
}
