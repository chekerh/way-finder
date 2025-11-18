import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PriceAlert {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  alertType: string; // 'flight', 'hotel', 'destination', 'activity'

  @Prop({ required: true, trim: true })
  itemId: string; // ID of the flight, hotel, destination, etc.

  @Prop({ type: Object, required: true })
  itemData: {
    name?: string;
    destination?: string;
    origin?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: any;
  };

  @Prop({ type: Number, required: true })
  targetPrice: number; // Price threshold to trigger alert

  @Prop({ type: String, required: true })
  currency: string; // EUR, USD, etc.

  @Prop({ type: String, enum: ['below', 'above'], default: 'below' })
  condition: 'below' | 'above'; // Alert when price goes below or above target

  @Prop({ type: Number, default: null })
  currentPrice: number | null; // Current price at time of alert creation

  @Prop({ type: Boolean, default: true })
  isActive: boolean; // Whether the alert is active

  @Prop({ type: Boolean, default: false })
  isTriggered: boolean; // Whether the alert has been triggered

  @Prop({ type: Date, default: null })
  triggeredAt: Date | null; // When the alert was triggered

  @Prop({ type: Date, default: null })
  expiresAt: Date | null; // Optional expiration date for the alert

  @Prop({ type: Number, default: 0 })
  triggerCount: number; // How many times this alert has been triggered

  @Prop({ type: Boolean, default: true })
  sendNotification: boolean; // Whether to send notification when triggered

  @Prop({ type: Boolean, default: true })
  sendEmail: boolean; // Whether to send email when triggered (future feature)
}

export type PriceAlertDocument = HydratedDocument<PriceAlert>;
export const PriceAlertSchema = SchemaFactory.createForClass(PriceAlert);

// Indexes for efficient queries
PriceAlertSchema.index({ userId: 1, isActive: 1 });
PriceAlertSchema.index({ alertType: 1, itemId: 1, isActive: 1 });
PriceAlertSchema.index({ isActive: 1, isTriggered: 1, expiresAt: 1 });

