import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  offer_id: string;

  @Prop({ type: Object })
  trip_details?: {
    origin?: string;
    destination?: string;
    departure_date?: string;
    return_date?: string;
    travel_class?: string;
    seats?: string;
  };

  @Prop({ type: [Object], default: [] })
  passengers?: Array<{
    full_name: string;
    traveler_type?: string;
    document_number?: string;
  }>;

  @Prop()
  notes?: string;

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ type: Object, required: true })
  payment_details: Record<string, any>;

  @Prop({ required: true })
  booking_date: Date;

  @Prop({ required: true })
  confirmation_number: string;

  @Prop({ required: true })
  total_price: number;
}

export type BookingDocument = HydratedDocument<Booking>;
export const BookingSchema = SchemaFactory.createForClass(Booking);

