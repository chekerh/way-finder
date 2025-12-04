import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_updated'
  | 'price_alert'
  | 'payment_success'
  | 'payment_failed'
  | 'trip_reminder'
  | 'post_liked'
  | 'post_commented'
  | 'journey_liked'
  | 'journey_commented'
  | 'general';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'booking_confirmed',
      'booking_cancelled',
      'booking_updated',
      'price_alert',
      'payment_success',
      'payment_failed',
      'trip_reminder',
      'post_liked',
      'post_commented',
      'journey_liked',
      'journey_commented',
      'general',
    ],
  })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: {} })
  data?: {
    bookingId?: string;
    destinationId?: string;
    price?: number;
    oldPrice?: number;
    [key: string]: any;
  };

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt?: Date | null;

  @Prop({ type: String, default: null })
  actionUrl?: string; // URL to navigate when notification is clicked

  // Added for TypeScript awareness (timestamps injected by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
// CRITICAL: Unique partial index to prevent duplicate notifications for the same booking and type
// This ensures at the database level that we can't have duplicate booking notifications of the same type
// Example: Can have both booking_confirmed AND booking_cancelled for same booking, but not two booking_cancelled
NotificationSchema.index(
  { userId: 1, type: 1, 'data.bookingId': 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: {
        $in: ['booking_cancelled', 'booking_confirmed', 'booking_updated'],
      },
      'data.bookingId': { $exists: true },
    },
    name: 'unique_booking_notification_index',
  },
);
