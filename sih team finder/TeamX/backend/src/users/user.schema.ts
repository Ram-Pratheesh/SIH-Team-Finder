import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: false, type: String }) // not required until signup is complete
  password?: string;

  @Prop({ default: false, type: Boolean })
  isProfileComplete: boolean;

  @Prop({ type: String, default: null }) // OTP code (hashed)
  otp?: string | null;

  @Prop({ type: Date, default: null }) // OTP expiry time
  otpExpiry?: Date | null;

  @Prop({ default: false, type: Boolean }) // whether email is verified
  isVerified: boolean;

  @Prop({ type: Number, default: 0 }) // failed OTP attempts
  otpAttempts?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
