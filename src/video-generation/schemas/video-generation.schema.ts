import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoGenerationDocument = VideoGeneration & Document;

@Schema({ timestamps: true })
export class VideoGeneration {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  predictionId: string;

  @Prop({ required: true })
  originalPrompt: string;

  @Prop()
  enhancedPrompt?: string;

  @Prop()
  status: string; // 'pending', 'processing', 'completed', 'failed', 'cancelled'

  @Prop()
  videoUrl?: string;

  @Prop()
  progress: number; // 0-100

  @Prop()
  error?: string;

  @Prop()
  images?: string[];

  @Prop()
  musicTrackId?: string;

  @Prop()
  estimatedTime?: string;

  @Prop()
  completedAt?: Date;
}

export const VideoGenerationSchema =
  SchemaFactory.createForClass(VideoGeneration);

// Add indexes
VideoGenerationSchema.index({ userId: 1, createdAt: -1 });
VideoGenerationSchema.index({ predictionId: 1 }, { unique: true });
VideoGenerationSchema.index({ status: 1 });
