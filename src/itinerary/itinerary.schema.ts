import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export class Activity {
  @Prop({ required: true })
  name: string;

  @Prop({ trim: true, default: null })
  description?: string;

  @Prop({ trim: true, default: null })
  location?: string;

  @Prop({ default: null })
  startTime?: string; // Format: "HH:mm"

  @Prop({ default: null })
  endTime?: string; // Format: "HH:mm"

  @Prop({ trim: true, default: null })
  category?: string; // e.g., "restaurant", "attraction", "hotel", "transport"

  @Prop({ default: null })
  cost?: number;

  @Prop({ trim: true, default: 'EUR' })
  currency?: string;

  @Prop({ trim: true, default: null })
  notes?: string;
}

export class DayPlan {
  @Prop({ required: true })
  date: string; // Format: "YYYY-MM-DD"

  @Prop({ type: [Activity], default: [] })
  activities: Activity[];

  @Prop({ trim: true, default: null })
  notes?: string;
}

@Schema({ timestamps: true })
export class Itinerary {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: null })
  description?: string;

  @Prop({ required: true })
  destination: string; // City or destination name

  @Prop({ required: true })
  startDate: string; // Format: "YYYY-MM-DD"

  @Prop({ required: true })
  endDate: string; // Format: "YYYY-MM-DD"

  @Prop({ type: [DayPlan], default: [] })
  days: DayPlan[];

  @Prop({ type: [String], default: [] })
  tags: string[]; // e.g., ["family", "adventure", "relaxation"]

  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @Prop({ type: Number, default: 0 })
  totalBudget?: number;

  @Prop({ trim: true, default: 'EUR' })
  currency?: string;
}

export type ItineraryDocument = HydratedDocument<Itinerary>;
export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);

/**
 * Database indexes for optimized query performance
 * - userId is already indexed in schema
 * - createdAt index: Enables efficient date-based sorting
 * - Compound indexes: Optimize common query patterns
 */
ItinerarySchema.index({ userId: 1, createdAt: -1 }); // User's itineraries sorted by date
ItinerarySchema.index({ destination: 1, isPublic: 1 }); // Public itineraries by destination
ItinerarySchema.index({ userId: 1, startDate: 1, endDate: 1 }); // Date range queries
