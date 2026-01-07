import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DiscountsService } from './discounts.service';
import {
  ApplyDiscountDto,
  DiscountType,
  AvailableDiscountsResponse,
  DiscountApplicationResponse,
} from './discounts.dto';

/**
 * Discounts Controller
 * Handles point-based discount operations
 */
@Controller('discounts')
@UseGuards(JwtAuthGuard)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  /**
   * Get all available discounts for the authenticated user
   * @param type - Optional filter by discount type
   */
  @Get()
  async getAvailableDiscounts(
    @Request() req,
    @Query('type') type?: DiscountType,
  ): Promise<AvailableDiscountsResponse> {
    return this.discountsService.getAvailableDiscounts(req.user.sub, type);
  }

  /**
   * Apply a discount using user points
   */
  @Post('apply')
  async applyDiscount(
    @Request() req,
    @Body() dto: ApplyDiscountDto,
  ): Promise<DiscountApplicationResponse> {
    return this.discountsService.applyDiscount(req.user.sub, dto);
  }

  /**
   * Get the best available discount for a specific amount and type
   */
  @Get('best')
  async getBestDiscount(
    @Request() req,
    @Query('type') type: DiscountType,
    @Query('amount') amount: number,
  ) {
    const discount = await this.discountsService.getBestDiscount(
      req.user.sub,
      type,
      amount,
    );
    return {
      discount,
      has_discount: discount !== null,
    };
  }
}
