import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OutfitDocument = HydratedDocument<Outfit>;

@Schema({ timestamps: true })
export class Outfit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  booking_id: Types.ObjectId;

  @Prop({ required: true })
  image_url: string;

  @Prop({ type: [String], default: [] })
  detected_items: string[]; // ['t-shirt', 'jeans', 'sneakers', etc.]

  @Prop({ type: Object })
  weather_data?: {
    temperature: number;
    condition: string; // 'sunny', 'rainy', 'cold', etc.
    humidity?: number;
    wind_speed?: number;
  };

  @Prop({ type: Object })
  recommendation?: {
    is_suitable: boolean;
    score: number; // 0-100
    feedback: string;
    suggestions?: string[];
  };

  @Prop({ default: false })
  is_approved: boolean; // User approved this outfit
}

export const OutfitSchema = SchemaFactory.createForClass(Outfit);

