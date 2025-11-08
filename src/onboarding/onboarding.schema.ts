import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OnboardingSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  session_id: string; // UUID

  @Prop({ type: Object, default: {} })
  answers: Record<string, any>; // { question_id: answer }

  @Prop({ type: [String], default: [] })
  questions_answered: string[]; // Array of question IDs

  @Prop({ type: String, default: null })
  current_question_id: string;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Date, default: null })
  completed_at: Date;

  @Prop({ type: Object, default: {} })
  extracted_preferences: {
    travel_type?: string;
    budget?: string;
    interests?: string[];
    accommodation_preference?: string;
    destination_preferences?: string[];
    group_size?: string;
    travel_frequency?: string;
    climate_preference?: string;
    duration_preference?: string;
  };
}

export type OnboardingSessionDocument = HydratedDocument<OnboardingSession>;
export const OnboardingSessionSchema = SchemaFactory.createForClass(OnboardingSession);

