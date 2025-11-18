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

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(@Req() req: any, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.sub, createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateReview(
    @Req() req: any,
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.sub, reviewId, updateReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReview(@Req() req: any, @Param('id') reviewId: string) {
    await this.reviewsService.deleteReview(req.user.sub, reviewId);
    return { message: 'Review deleted successfully' };
  }

  @Get(':itemType/:itemId')
  async getReviews(
    @Param('itemType') itemType: ReviewItemType,
    @Param('itemId') itemId: string,
  ) {
    return this.reviewsService.getReviews(itemType, itemId);
  }

  @Get(':itemType/:itemId/stats')
  async getReviewStats(
    @Param('itemType') itemType: ReviewItemType,
    @Param('itemId') itemId: string,
  ) {
    return this.reviewsService.getReviewStats(itemType, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/my-reviews')
  async getUserReviews(
    @Req() req: any,
    @Query('type') itemType?: ReviewItemType,
  ) {
    return this.reviewsService.getUserReviews(req.user.sub, itemType);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:itemType/:itemId')
  async checkUserReview(
    @Req() req: any,
    @Param('itemType') itemType: ReviewItemType,
    @Param('itemId') itemId: string,
  ) {
    return this.reviewsService.checkUserReview(req.user.sub, itemType, itemId);
  }
}

