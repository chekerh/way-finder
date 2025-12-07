import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommissionDocument = Commission & Document;

@Schema({ timestamps: true })
export class Commission {
  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  itemType: string; // 'flight', 'accommodation', 'upsell'

  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  basePrice: number;

  @Prop({ required: true })
  commissionRate: number; // Percentage (e.g., 15.0 for 15%)

  @Prop({ required: true })
  commissionAmount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';

  @Prop()
  paidAt?: Date;

  @Prop()
  notes?: string;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);

