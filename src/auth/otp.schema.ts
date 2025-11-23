import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class OTP {
  @Prop({ required: true, index: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, length: 4 })
  code: string; // 4-digit code

  @Prop({ required: true, expires: 600 }) // Expires after 10 minutes (600 seconds)
  expires_at: Date;

  @Prop({ type: Boolean, default: false })
  used: boolean; // Mark as used after verification
}

export type OTPDocument = HydratedDocument<OTP>;
export const OTPSchema = SchemaFactory.createForClass(OTP);

// Create TTL index for automatic deletion of expired OTPs
OTPSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
// Create index on email for faster lookups
OTPSchema.index({ email: 1, used: 1 });

