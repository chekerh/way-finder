import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserStatus } from '../common/enums/user-status.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true, trim: true })
  username: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({ required: true, trim: true })
  first_name: string;

  @Prop({ required: true, trim: true })
  last_name: string;

  @Prop({ trim: true, default: null })
  phone?: string;

  @Prop({ trim: true, default: null })
  location?: string;

  @Prop({ trim: true, default: null, maxlength: 500 })
  bio?: string;

  @Prop({ trim: true, default: null })
  profile_image_url?: string;

  @Prop({ required: false }) // Made optional for Google OAuth users
  password?: string;

  @Prop({ type: String, trim: true, default: null })
  google_id?: string; // Google user ID for OAuth

  @Prop({ type: Boolean, default: false })
  email_verified: boolean; // Email verification status

  @Prop({ type: String, default: null })
  email_verification_token?: string; // Token for email verification

  @Prop({ type: Date, default: null })
  email_verified_at?: Date; // When email was verified

  @Prop({ type: [String], default: [] })
  preferences: string[];

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ type: Boolean, default: false })
  onboarding_completed: boolean;

  @Prop({ type: Date, default: null })
  onboarding_completed_at: Date;

  @Prop({ type: Boolean, default: false })
  onboarding_skipped: boolean;

  @Prop({ type: Object, default: {} })
  onboarding_preferences: {
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

  @Prop({ type: String, default: null })
  fcm_token?: string; // Firebase Cloud Messaging token for push notifications

  @Prop({ type: Number, default: 0 })
  total_points: number; // Current available points

  @Prop({ type: Number, default: 0 })
  lifetime_points: number; // Total points earned over lifetime

  @Prop({ type: Number, default: 0 })
  current_streak: number; // Current daily login streak

  @Prop({ type: Number, default: 0 })
  longest_streak: number; // Longest streak achieved

  @Prop({ type: Date, default: null })
  last_login_date?: Date; // For streak calculation
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

// Ensure google_id index is sparse (allows multiple null values)
// This fixes the duplicate key error when multiple users sign up without Google
UserSchema.index({ google_id: 1 }, { unique: true, sparse: true });
