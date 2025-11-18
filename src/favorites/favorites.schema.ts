import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ required: true, index: true })
  user_id: string;

  @Prop({ required: true })
  item_type: 'flight' | 'destination' | 'activity' | 'hotel';

  @Prop({ required: true })
  item_id: string;

  @Prop({ type: Object, default: {} })
  item_data: {
    name?: string;
    city?: string;
    country?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    airline?: string;
    [key: string]: any;
  };

  @Prop({ default: Date.now })
  favorited_at: Date;
}

export type FavoriteDocument = HydratedDocument<Favorite>;
export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Compound index to ensure unique user-item pairs
FavoriteSchema.index({ user_id: 1, item_type: 1, item_id: 1 }, { unique: true });

