import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewItemType = 'flight' | 'hotel' | 'activity' | 'destination';

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['flight', 'hotel', 'activity', 'destination'],
    index: true,
  })
  itemType: ReviewItemType;

  @Prop({ required: true, index: true })
  itemId: string; // ID of the reviewed item (e.g., flight offer ID, destination ID)

  @Prop({ required: true, min: 1, max: 5 })
  rating: number; // 1-5 stars

  @Prop({ trim: true, maxlength: 1000 })
  comment?: string;

  @Prop({ type: Object, default: {} })
  details?: {
    // Flight-specific details
    comfort?: number;
    service?: number;
    value?: number;
    punctuality?: number;
    // Hotel-specific details
    cleanliness?: number;
    location?: number;
    amenities?: number;
    // Activity-specific details
    experience?: number;
    guide?: number;
  };

  @Prop({ type: Boolean, default: true })
  isVisible: boolean; // For moderation
}

export type ReviewDocument = HydratedDocument<Review>;
export const ReviewSchema = SchemaFactory.createForClass(Review);

/**
 * Database indexes for optimized query performance
 * - Compound unique index: Prevents duplicate reviews and enables fast lookups
 * - itemType + itemId index: Fast queries for reviews of specific items
 * - userId index: Efficient queries for user's reviews (already indexed in schema)
 */
ReviewSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true }); // Prevents duplicates
ReviewSchema.index({ itemType: 1, itemId: 1, createdAt: -1 }); // Reviews for an item sorted by date
ReviewSchema.index({ itemType: 1, itemId: 1, rating: -1 }); // Reviews sorted by rating
