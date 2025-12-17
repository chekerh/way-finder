import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TravelPlanDocument = TravelPlan & Document;

@Schema({ timestamps: true })
export class TravelPlan {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  destinations: string[];

  @Prop({ required: true })
  duration: string;

  @Prop({ type: [String], default: [] })
  activities: string[];

  @Prop({ required: true })
  videoPrompt: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  usageCount: number;
}

export const TravelPlanSchema = SchemaFactory.createForClass(TravelPlan);

// Add indexes
TravelPlanSchema.index({ isActive: 1 });
