// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Step 1: Request OTP (only email)
  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    const result = await this.authService.requestOtp(dto.email);
    return { success: true, message: result.message };
  }

  // Step 2: Verify OTP
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(dto.email, dto.otp);
    return { success: true, message: result.message };
  }

  // Step 3: Complete signup (only allowed if OTP verified)
  @Post('signup')
  async completeSignup(@Body() dto: SignupDto) {
    const result = await this.authService.completeSignup(dto);
    return {
      success: true,
      message: result.message,
      user: result.user,
      token: result.token,
    };
  }

  // Login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      success: true,
      message: result.message,
      user: result.user,
      token: result.token,
    };
  }
}
