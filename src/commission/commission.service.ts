import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commission, CommissionDocument } from './commission.schema';

export interface CommissionCalculation {
  basePrice: number;
  commissionRate: number;
  commissionAmount: number;
  totalPrice: number;
}

@Injectable()
export class CommissionService {
  constructor(
    @InjectModel(Commission.name)
    private commissionModel: Model<CommissionDocument>,
  ) {}

  /**
   * Calculate commission for different product types
   */
  calculateCommission(
    basePrice: number,
    productType: 'flight' | 'accommodation' | 'upsell',
    upsellCategory?: string,
  ): CommissionCalculation {
    let commissionRate = 0;

    switch (productType) {
      case 'flight':
        commissionRate = 10.0; // 10% for flights
        break;
      case 'accommodation':
        commissionRate = 15.0; // 15% for accommodations
        break;
      case 'upsell':
        // Different rates based on upsell category
        commissionRate = this.getUpsellCommissionRate(upsellCategory);
        break;
      default:
        commissionRate = 10.0;
    }

    const commissionAmount = (basePrice * commissionRate) / 100;
    const totalPrice = basePrice + commissionAmount;

    return {
      basePrice,
      commissionRate,
      commissionAmount,
      totalPrice,
    };
  }

  /**
   * Get commission rate for upsell products based on category
   */
  private getUpsellCommissionRate(category?: string): number {
    const rates: Record<string, number> = {
      travel_insurance: 18.0,
      airport_transfer: 12.0,
      car_rental: 15.0,
      activity: 20.0,
      baggage_insurance: 12.0,
      seat_selection: 8.0,
      lounge_access: 25.0,
      wifi_data: 35.0,
    };

    return category ? rates[category] || 15.0 : 15.0;
  }

  /**
   * Create commission records for a booking
   */
  async createCommissions(
    bookingId: string,
    userId: string,
    items: Array<{
      type: 'flight' | 'accommodation' | 'upsell';
      id: string;
      name: string;
      basePrice: number;
      currency: string;
      category?: string;
    }>,
  ): Promise<CommissionDocument[]> {
    const commissions = items.map((item) => {
      const calculation = this.calculateCommission(
        item.basePrice,
        item.type,
        item.category,
      );

      return {
        bookingId,
        userId,
        itemType: item.type,
        itemId: item.id,
        itemName: item.name,
        basePrice: item.basePrice,
        commissionRate: calculation.commissionRate,
        commissionAmount: calculation.commissionAmount,
        currency: item.currency,
        status: 'pending' as const,
      };
    });

    return this.commissionModel.insertMany(commissions);
  }

  /**
   * Get commissions for a booking
   */
  async getCommissionsByBookingId(
    bookingId: string,
  ): Promise<CommissionDocument[]> {
    return this.commissionModel.find({ bookingId }).exec();
  }

  /**
   * Get total commission for a booking
   */
  async getTotalCommission(bookingId: string): Promise<number> {
    const commissions = await this.getCommissionsByBookingId(bookingId);
    return commissions.reduce(
      (sum, commission) => sum + commission.commissionAmount,
      0,
    );
  }

  /**
   * Update commission status
   */
  async updateCommissionStatus(
    commissionId: string,
    status: 'pending' | 'confirmed' | 'paid' | 'cancelled',
  ): Promise<CommissionDocument | null> {
    const update: any = { status };
    if (status === 'paid') {
      update.paidAt = new Date();
    }
    return this.commissionModel
      .findByIdAndUpdate(commissionId, update, { new: true })
      .exec();
  }

  /**
   * Mark all commissions for a booking as confirmed
   */
  async confirmCommissions(bookingId: string): Promise<void> {
    await this.commissionModel
      .updateMany({ bookingId }, { status: 'confirmed' })
      .exec();
  }

  /**
   * Get user's total commissions
   */
  async getUserCommissions(
    userId: string,
    status?: string,
  ): Promise<CommissionDocument[]> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }
    return this.commissionModel.find(query).exec();
  }
}
