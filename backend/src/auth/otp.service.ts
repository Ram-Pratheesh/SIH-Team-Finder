import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class OtpService {
  constructor(
    private readonly emailService: EmailService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async generateAndSaveOtp(email: string): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    await this.userModel.updateOne(
      { email },
      { otp, otpExpiry, isVerified: false },
    );

    return otp;
  }

  async sendOtp(email: string): Promise<void> {
    const otp = await this.generateAndSaveOtp(email);
    await this.emailService.sendEmail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    if (!user) return false;

    if (!user.otp || user.otp !== otp) return false;
    if (!user.otpExpiry || user.otpExpiry < new Date()) return false;

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return true;
  }
}
