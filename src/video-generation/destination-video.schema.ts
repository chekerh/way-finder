import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DestinationVideo {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  destination: string; // e.g., "Paris", "Berlin"

  @Prop({ type: String, default: null })
  video_url?: string; // Final video URL

  @Prop({
    type: String,
    enum: ['not_started', 'processing', 'ready', 'failed'],
    default: 'not_started',
  })
  status: 'not_started' | 'processing' | 'ready' | 'failed';

  @Prop({ type: [String], default: [] })
  image_urls: string[]; // All aggregated image URLs for this destination

  @Prop({ type: Number, default: 0 })
  image_count: number; // Total number of images used

  @Prop({ type: String, default: null })
  music_url?: string; // URL of the music file used

  @Prop({ type: String, default: null })
  music_source?: string; // e.g., "pixabay", "ai_generated"

  @Prop({ type: Date, default: null })
  generated_at?: Date; // When video was successfully generated

  @Prop({ type: String, default: null })
  error_message?: string; // Error message if generation failed

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Additional metadata (tags, descriptions, etc.)
}

export type DestinationVideoDocument = HydratedDocument<DestinationVideo>;
export const DestinationVideoSchema = SchemaFactory.createForClass(DestinationVideo);

// Compound index for efficient queries: user + destination
DestinationVideoSchema.index({ user_id: 1, destination: 1 }, { unique: true });
// Index for status queries
DestinationVideoSchema.index({ user_id: 1, status: 1 });

