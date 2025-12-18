import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MusicTrackDocument = MusicTrack & Document;

@Schema({ timestamps: true })
export class MusicTrack {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ required: true })
  duration: string;

  @Prop()
  previewUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  usageCount: number;
}

export const MusicTrackSchema = SchemaFactory.createForClass(MusicTrack);

// Add indexes
MusicTrackSchema.index({ genre: 1 });
MusicTrackSchema.index({ isActive: 1 });
