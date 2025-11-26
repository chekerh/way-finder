import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TravelTipDocument = HydratedDocument<TravelTip>;

@Schema({ timestamps: true })
export class TravelTip {
  @Prop({ required: true, index: true })
  destinationId: string;

  @Prop({ required: true })
  destinationName: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop({ required: true, type: String })
  category:
    | 'general'
    | 'transportation'
    | 'accommodation'
    | 'food'
    | 'culture'
    | 'safety'
    | 'budget'
    | 'weather';

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  helpfulCount: number;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TravelTipSchema = SchemaFactory.createForClass(TravelTip);

// Create indexes for efficient queries
TravelTipSchema.index({ destinationId: 1, category: 1 });
TravelTipSchema.index({ destinationId: 1, isActive: 1 });
