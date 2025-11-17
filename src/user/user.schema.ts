import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserStatus } from '../common/enums/user-status.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, index: true, trim: true, lowercase: true })
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

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  preferences: string[];

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ type: Boolean, default: false })
  onboarding_completed: boolean;

  @Prop({ type: Date, default: null })
  onboarding_completed_at: Date;

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
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
