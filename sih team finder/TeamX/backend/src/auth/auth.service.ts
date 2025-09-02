// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private async generateToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '2d',
    });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  // Step 1: Request OTP
  async requestOtp(email: string) {
    let user = await this.userModel.findOne({ email });

    if (user && user.isVerified) {
      throw new BadRequestException('Email already registered and verified');
    }

    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (!user) {
      user = new this.userModel({
        email,
        isVerified: false,
        otpAttempts: 0,
      });
    }

    user.otp = otpHash;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0; // reset attempts on new OTP
    await user.save();

    await this.emailService.sendEmail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your verification code is: ${otp}. It will expire in 5 minutes.`,
    });

    return { message: 'OTP sent to your email' };
  }

  // Step 2: Verify OTP
  async verifyOtp(email: string, otp: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) throw new BadRequestException('Already verified');

    // Check expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    // Retry limit
    if ((user.otpAttempts ?? 0) >= 3) {
      throw new BadRequestException('Too many failed attempts. Request a new OTP.');
    }

    const otpHash = this.hashOtp(otp);
    if (user.otp !== otpHash) {
      user.otpAttempts = (user.otpAttempts ?? 0) + 1;
      await user.save();
      throw new BadRequestException('Invalid OTP');
    }

    // Mark verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    return { message: 'OTP verified. You can now complete signup.' };
  }

  // Step 3: Complete signup (set password)
  async completeSignup(data: SignupDto) {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) throw new BadRequestException('User not found');
    if (!user.isVerified)
      throw new BadRequestException('Please verify your email first');

    if (user.password) {
      throw new BadRequestException('Password already set');
    }

    user.password = await bcrypt.hash(data.password, 10);
    await user.save();

    const payload = { sub: user._id, email: user.email };
    const token = await this.generateToken(payload);

    return {
      message: 'Signup completed successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }

  // Login
  async login(data: LoginDto) {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isVerified)
      throw new UnauthorizedException('Please verify your email first');

    if (!user.password) {
      throw new UnauthorizedException('Password not set. Please complete signup.');
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email };
    const token = await this.generateToken(payload);

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }
}
