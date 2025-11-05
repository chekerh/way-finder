import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  transaction_id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  payment_status: string; // success | failed

  @Prop({ required: true })
  transaction_date: Date;

  @Prop({ required: true })
  payment_method: string; // Stripe | PayPal
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);

