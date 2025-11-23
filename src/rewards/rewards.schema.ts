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
export const PointsTransactionSchema = SchemaFactory.createForClass(PointsTransaction);

// Index for efficient queries
PointsTransactionSchema.index({ user_id: 1, transaction_date: -1 });
PointsTransactionSchema.index({ user_id: 1, type: 1 });

