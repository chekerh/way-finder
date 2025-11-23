import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, GoogleSignInDto, VerifyEmailDto, SendOTPDto, VerifyOTPDto, RegisterWithOTPDto, SendOTPForRegistrationDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

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

  @Post('resend-verification')
  resendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post('send-otp')
  sendOTP(@Body() dto: SendOTPDto) {
    return this.authService.sendOTP(dto);
  }

  @Post('verify-otp')
  verifyOTP(@Body() dto: VerifyOTPDto) {
    return this.authService.verifyOTP(dto);
  }

  @Post('send-otp-for-registration')
  sendOTPForRegistration(@Body() dto: SendOTPForRegistrationDto) {
    return this.authService.sendOTPForRegistration(dto);
  }

  @Post('register-with-otp')
  registerWithOTP(@Body() dto: RegisterWithOTPDto) {
    return this.authService.registerWithOTP(dto);
  }
}

