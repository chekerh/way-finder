import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OutfitDocument = HydratedDocument<Outfit>;

@Schema({ timestamps: true, collection: 'outfits' })
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

  @Prop({ type: Date })
  outfit_date?: Date; // Date for which this outfit is intended (e.g., 2025-11-30)
}

export const OutfitSchema = SchemaFactory.createForClass(Outfit);

