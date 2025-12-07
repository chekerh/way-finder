import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { RewardsService } from './rewards.service';
import {
  DiscountDto,
  DiscountType,
  DiscountStatus,
  ApplyDiscountDto,
  DiscountApplicationResponse,
  AvailableDiscountsResponse,
} from './discounts.dto';
import { PointsSource } from './rewards.dto';

/**
 * Discount Service
 * Manages point-based discounts for various services (luggage, taxes, etc.)
 */
@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);

  // Define discount tiers based on points
  private readonly discountTiers: DiscountDto[] = [
    // Luggage discounts
    {
      discount_id: 'luggage_10',
      type: DiscountType.LUGGAGE,
      name: '10% Luggage Discount',
      description: 'Get 10% off on luggage fees',
      points_required: 100,
      discount_percentage: 10,
      max_discount_amount: 50, // Max $50 discount
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    {
      discount_id: 'luggage_15',
      type: DiscountType.LUGGAGE,
      name: '15% Luggage Discount',
      description: 'Get 15% off on luggage fees',
      points_required: 150,
      discount_percentage: 15,
      max_discount_amount: 75, // Max $75 discount
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    {
      discount_id: 'luggage_20',
      type: DiscountType.LUGGAGE,
      name: '20% Luggage Discount',
      description: 'Get 20% off on luggage fees',
      points_required: 200,
      discount_percentage: 20,
      max_discount_amount: 100, // Max $100 discount
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    {
      discount_id: 'luggage_free',
      type: DiscountType.LUGGAGE,
      name: 'Free Luggage',
      description: 'Get free luggage (up to $150 value)',
      points_required: 300,
      discount_percentage: 100,
      max_discount_amount: 150, // Max $150 discount (free)
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    // Tax discounts
    {
      discount_id: 'taxes_10',
      type: DiscountType.TAXES,
      name: '10% Tax Discount',
      description: 'Get 10% off on taxes and fees',
      points_required: 100,
      discount_percentage: 10,
      max_discount_amount: 30, // Max $30 discount
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    {
      discount_id: 'taxes_15',
      type: DiscountType.TAXES,
      name: '15% Tax Discount',
      description: 'Get 15% off on taxes and fees',
      points_required: 150,
      discount_percentage: 15,
      max_discount_amount: 50, // Max $50 discount
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    {
      discount_id: 'taxes_free',
      type: DiscountType.TAXES,
      name: 'Free Taxes',
      description: 'Get free taxes and fees (up to $100 value)',
      points_required: 250,
      discount_percentage: 100,
      max_discount_amount: 100, // Max $100 discount (free)
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    // Service fee discounts
    {
      discount_id: 'service_10',
      type: DiscountType.SERVICE_FEE,
      name: '10% Service Fee Discount',
      description: 'Get 10% off on service fees',
      points_required: 80,
      discount_percentage: 10,
      max_discount_amount: 20, // Max $20 discount
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    {
      discount_id: 'service_free',
      type: DiscountType.SERVICE_FEE,
      name: 'Free Service Fee',
      description: 'Get free service fees (up to $30 value)',
      points_required: 200,
      discount_percentage: 100,
      max_discount_amount: 30, // Max $30 discount (free)
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    // General discount
    {
      discount_id: 'general_5',
      type: DiscountType.GENERAL,
      name: '5% General Discount',
      description: 'Get 5% off on total booking',
      points_required: 150,
      discount_percentage: 5,
      max_discount_amount: 100, // Max $100 discount
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
    {
      discount_id: 'general_10',
      type: DiscountType.GENERAL,
      name: '10% General Discount',
      description: 'Get 10% off on total booking',
      points_required: 250,
      discount_percentage: 10,
      max_discount_amount: 200, // Max $200 discount
      status: DiscountStatus.AVAILABLE,
      is_available: true,
    },
  ];

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly rewardsService: RewardsService,
  ) {}

  /**
   * Get all available discounts
   */
  getAllDiscounts(): DiscountDto[] {
    return this.discountTiers.filter((discount) => discount.is_available);
  }

  /**
   * Get available discounts for a user based on their points
   */
  async getAvailableDiscounts(
    userId: string,
    type?: DiscountType,
  ): Promise<AvailableDiscountsResponse> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userPoints = user.total_points || 0;
    let discounts = this.getAllDiscounts();

    // Filter by type if provided
    if (type) {
      discounts = discounts.filter((d) => d.type === type);
    }

    // Filter discounts the user can afford
    const eligibleDiscounts = discounts.filter(
      (discount) => discount.points_required <= userPoints,
    );

    return {
      available_discounts: discounts,
      user_points: userPoints,
      eligible_discounts: eligibleDiscounts,
    };
  }

  /**
   * Get discount by ID
   */
  getDiscountById(discountId: string): DiscountDto | null {
    return (
      this.discountTiers.find(
        (d) => d.discount_id === discountId && d.is_available,
      ) || null
    );
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(
    originalAmount: number,
    discountPercentage: number,
    maxDiscountAmount?: number,
  ): number {
    const discountAmount = (originalAmount * discountPercentage) / 100;
    if (maxDiscountAmount) {
      return Math.min(discountAmount, maxDiscountAmount);
    }
    return discountAmount;
  }

  /**
   * Apply a discount using user points
   */
  async applyDiscount(
    userId: string,
    dto: ApplyDiscountDto,
  ): Promise<DiscountApplicationResponse> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get discount details
    const discount = this.getDiscountById(dto.discount_id);
    if (!discount) {
      throw new NotFoundException('Discount not found or not available');
    }

    // Check if user has enough points
    const userPoints = user.total_points || 0;
    if (userPoints < discount.points_required) {
      throw new BadRequestException(
        `Insufficient points. Required: ${discount.points_required}, Available: ${userPoints}`,
      );
    }

    // Validate discount type matches
    if (discount.type !== dto.type) {
      throw new BadRequestException(
        `Discount type mismatch. Expected: ${discount.type}, Got: ${dto.type}`,
      );
    }

    // Calculate discount amount
    const originalAmount = dto.original_amount || 0;
    const discountAmount = this.calculateDiscount(
      originalAmount,
      discount.discount_percentage,
      discount.max_discount_amount,
    );

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    // Redeem points
    const redemptionResult = await this.rewardsService.redeemPoints(
      userId,
      discount.points_required,
      `Applied discount: ${discount.name}`,
      {
        discount_id: discount.discount_id,
        discount_type: discount.type,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        ...dto.metadata,
      },
    );

    this.logger.log(
      `Applied discount ${discount.discount_id} for user ${userId}. Points used: ${discount.points_required}, Discount: $${discountAmount.toFixed(2)}`,
    );

    return {
      success: true,
      discount_applied: discountAmount,
      points_used: discount.points_required,
      remaining_points: redemptionResult.remaining_points,
      final_amount: finalAmount,
      transaction_id: redemptionResult.transaction_id,
      message: `Successfully applied ${discount.name}. You saved $${discountAmount.toFixed(2)}!`,
    };
  }

  /**
   * Get best available discount for a specific amount and type
   */
  async getBestDiscount(
    userId: string,
    type: DiscountType,
    amount: number,
  ): Promise<DiscountDto | null> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userPoints = user.total_points || 0;
    const availableDiscounts = await this.getAvailableDiscounts(userId, type);

    // Filter discounts user can afford and sort by discount value
    const eligibleDiscounts = availableDiscounts.eligible_discounts
      .filter((discount) => {
        const discountAmount = this.calculateDiscount(
          amount,
          discount.discount_percentage,
          discount.max_discount_amount,
        );
        return discountAmount > 0; // Only discounts that provide value
      })
      .sort((a, b) => {
        // Sort by discount value (descending)
        const discountA = this.calculateDiscount(
          amount,
          a.discount_percentage,
          a.max_discount_amount,
        );
        const discountB = this.calculateDiscount(
          amount,
          b.discount_percentage,
          b.max_discount_amount,
        );
        return discountB - discountA;
      });

    return eligibleDiscounts.length > 0 ? eligibleDiscounts[0] : null;
  }
}

