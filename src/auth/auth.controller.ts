import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  GoogleSignInDto,
  VerifyEmailDto,
  SendOTPDto,
  VerifyOTPDto,
  RegisterWithOTPDto,
  SendOTPForRegistrationDto,
} from './auth.dto';

/**
 * Authentication Controller
 * Handles user authentication, registration, email verification, and OTP-based login
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account
   * Rate limited: 5 requests per minute to prevent abuse
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * User login
   * Rate limited: 5 requests per minute to prevent brute force attacks
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  googleSignIn(@Body() dto: GoogleSignInDto) {
    return this.authService.googleSignIn(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Get('verify-email')
  verifyEmailGet(@Query('token') token: string) {
    return this.authService.verifyEmail({ token });
  }

  /**
   * Resend email verification
   * Rate limited: 3 requests per minute to prevent spam
   */
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('resend-verification')
  resendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  /**
   * Send OTP for login
   * Rate limited: 3 requests per minute to prevent spam
   */
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('send-otp')
  sendOTP(@Body() dto: SendOTPDto) {
    return this.authService.sendOTP(dto);
  }

  @Post('verify-otp')
  verifyOTP(@Body() dto: VerifyOTPDto) {
    return this.authService.verifyOTP(dto);
  }

  /**
   * Send OTP for registration
   * Rate limited: 3 requests per minute to prevent spam
   */
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('send-otp-for-registration')
  sendOTPForRegistration(@Body() dto: SendOTPForRegistrationDto) {
    return this.authService.sendOTPForRegistration(dto);
  }

  @Post('register-with-otp')
  registerWithOTP(@Body() dto: RegisterWithOTPDto) {
    return this.authService.registerWithOTP(dto);
  }
}
