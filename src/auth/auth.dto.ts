import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class GoogleSignInDto {
  @IsString()
  @IsNotEmpty()
  id_token: string; // Google ID token

  @IsOptional()
  @IsString()
  @IsIn(['web', 'android'])
  client_type?: 'web' | 'android'; // Type of client (web or android)
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string; // Email verification token
}

export class SendOTPDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOTPDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string; // 4-digit OTP code
}

