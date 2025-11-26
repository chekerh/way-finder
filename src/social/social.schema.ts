import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// Schema for user follows (who follows whom)
@Schema({ timestamps: true })
export class UserFollow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  followerId: Types.ObjectId; // User who is following

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  followingId: Types.ObjectId; // User being followed

  @Prop({ default: Date.now })
  followedAt: Date;
}

export type UserFollowDocument = HydratedDocument<UserFollow>;
export const UserFollowSchema = SchemaFactory.createForClass(UserFollow);

// Create compound index to prevent duplicate follows
UserFollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Schema for shared trips/posts
@Schema({ timestamps: true })
export class SharedTrip {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: null })
  description?: string;

  @Prop({
    type: String,
    enum: ['itinerary', 'booking', 'destination', 'custom'],
    required: true,
  })
  tripType: 'itinerary' | 'booking' | 'destination' | 'custom';

  @Prop({ type: Types.ObjectId, refPath: 'tripTypeRef', default: null })
  tripId?: Types.ObjectId; // Reference to itinerary, booking, etc.

  @Prop({ type: String, default: null })
  tripTypeRef?: string; // Dynamic reference: 'Itinerary', 'Booking', etc.

  @Prop({ type: [String], default: [] })
  images: string[]; // Array of image URLs

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Additional trip data (destination, dates, etc.)

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  commentsCount: number;

  @Prop({ type: Number, default: 0 })
  sharesCount: number;

  @Prop({ type: Boolean, default: true })
  isPublic: boolean; // Whether the trip is visible to everyone or just followers

  @Prop({ type: Boolean, default: true })
  isVisible: boolean; // Soft delete flag
}

export type SharedTripDocument = HydratedDocument<SharedTrip>;
export const SharedTripSchema = SchemaFactory.createForClass(SharedTrip);

// Indexes for efficient queries
SharedTripSchema.index({ userId: 1, createdAt: -1 });
SharedTripSchema.index({ isPublic: 1, isVisible: 1, createdAt: -1 });
SharedTripSchema.index({ tags: 1 });
