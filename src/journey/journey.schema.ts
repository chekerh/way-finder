import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Journey {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  booking_id: Types.ObjectId; // Required: Must be linked to a confirmed booking

  @Prop({ required: true, trim: true })
  destination: string; // Auto-populated from booking

  @Prop({ type: [String], default: [] })
  image_urls: string[]; // Array of uploaded image URLs

  @Prop({
    type: [
      {
        imageUrl: { type: String, required: true },
        caption: { type: String, default: null },
      },
    ],
    default: [],
  })
  slides: { imageUrl: string; caption?: string }[];

  @Prop({ type: String, default: null, trim: true })
  music_theme?: string;

  @Prop({ type: String, default: null, trim: true, maxlength: 280 })
  caption_text?: string;

  @Prop({ type: String, default: null })
  video_url?: string; // AI-generated video URL

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  video_status: 'pending' | 'processing' | 'completed' | 'failed';

  @Prop({ trim: true, default: '' })
  description?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Number, default: 0 })
  likes_count: number;

  @Prop({ type: Number, default: 0 })
  comments_count: number;

  @Prop({ type: Boolean, default: true })
  is_public: boolean;

  @Prop({ type: Boolean, default: true })
  is_visible: boolean; // Soft delete flag

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Additional journey data
}

export type JourneyDocument = HydratedDocument<Journey>;
export const JourneySchema = SchemaFactory.createForClass(Journey);

// Indexes for efficient queries
JourneySchema.index({ user_id: 1, createdAt: -1 });
JourneySchema.index({ booking_id: 1 });
JourneySchema.index({ is_public: 1, is_visible: 1, createdAt: -1 });
JourneySchema.index({ destination: 1 });

// Schema for journey likes
@Schema({ timestamps: true })
export class JourneyLike {
  @Prop({ type: Types.ObjectId, ref: 'Journey', required: true, index: true })
  journey_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;
}

export type JourneyLikeDocument = HydratedDocument<JourneyLike>;
export const JourneyLikeSchema = SchemaFactory.createForClass(JourneyLike);

// Create compound index to prevent duplicate likes
JourneyLikeSchema.index({ journey_id: 1, user_id: 1 }, { unique: true });

// Schema for journey comments
@Schema({ timestamps: true })
export class JourneyComment {
  @Prop({ type: Types.ObjectId, ref: 'Journey', required: true, index: true })
  journey_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'JourneyComment', default: null })
  parent_comment_id?: Types.ObjectId; // For nested comments/replies
}

export type JourneyCommentDocument = HydratedDocument<JourneyComment>;
export const JourneyCommentSchema =
  SchemaFactory.createForClass(JourneyComment);

// Indexes for efficient queries
JourneyCommentSchema.index({ journey_id: 1, createdAt: -1 });
JourneyCommentSchema.index({ user_id: 1 });
