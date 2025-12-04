import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PointsTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  points: number; // Can be positive (earned) or negative (redeemed)

  @Prop({ required: true })
  type: string; // 'earned' | 'redeemed' | 'bonus' | 'penalty'

  @Prop({ required: true })
  source: string; // 'onboarding' | 'booking' | 'review' | 'share' | 'streak' | 'achievement' | 'referral'

  @Prop({ type: String, default: null })
  description?: string; // Human-readable description

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>; // Additional data (booking_id, achievement_type, etc.)

  @Prop({ type: Date, default: Date.now })
  transaction_date: Date;
}

export type PointsTransactionDocument = HydratedDocument<PointsTransaction>;
export const PointsTransactionSchema =
  SchemaFactory.createForClass(PointsTransaction);

/**
 * Database indexes for optimized query performance
 * - user_id index: Fast lookups for user's points transactions
 * - Compound indexes: Optimize common query patterns
 */
PointsTransactionSchema.index({ user_id: 1, transaction_date: -1 }); // User's transactions sorted by date
PointsTransactionSchema.index({ user_id: 1, type: 1, transaction_date: -1 }); // User's transactions by type
PointsTransactionSchema.index({ user_id: 1, source: 1 }); // Transactions by source (e.g., booking, review)
