import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SearchHistory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  searchType: string; // 'flight', 'hotel', 'destination', 'activity', 'general'

  @Prop({ type: Object, required: true })
  searchParams: {
    origin?: string;
    destination?: string;
    dateFrom?: string;
    dateTo?: string;
    adults?: number;
    children?: number;
    travelClass?: string;
    maxPrice?: number;
    minPrice?: number;
    city?: string;
    themes?: string[];
    query?: string; // For general searches
    [key: string]: any; // Allow additional search parameters
  };

  @Prop({ trim: true, default: null })
  searchQuery?: string; // Human-readable search query for display

  @Prop({ type: Boolean, default: false })
  isSaved: boolean; // Whether this is a saved search

  @Prop({ trim: true, default: null })
  savedName?: string; // Custom name for saved searches

  @Prop({ type: Number, default: 1 })
  searchCount: number; // How many times this search was performed

  @Prop({ type: Date, default: Date.now })
  lastSearchedAt: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean; // Soft delete flag
}

export type SearchHistoryDocument = HydratedDocument<SearchHistory>;
export const SearchHistorySchema = SchemaFactory.createForClass(SearchHistory);

// Indexes for efficient queries
SearchHistorySchema.index({ userId: 1, lastSearchedAt: -1 });
SearchHistorySchema.index({ userId: 1, isSaved: 1, lastSearchedAt: -1 });
SearchHistorySchema.index({ userId: 1, searchType: 1, lastSearchedAt: -1 });
