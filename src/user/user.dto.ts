import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserStatus } from '../common/enums/user-status.enum';

export class CreateUserDto {
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

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string; // Optional for Google OAuth users

  @IsOptional()
  @IsString()
  google_id?: string;

  @IsOptional()
  email_verified?: boolean;

  @IsOptional()
  @IsString()
  email_verification_token?: string;

  @IsOptional()
  email_verified_at?: Date;

  @IsOptional()
  @IsString()
  profile_image_url?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  profile_image_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferences?: string[];

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  onboarding_completed?: boolean;

  @IsOptional()
  onboarding_completed_at?: Date;

  @IsOptional()
  onboarding_skipped?: boolean;

  @IsOptional()
  onboarding_preferences?: any;
}

export class UserDto {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  preferences: string[];
  status: UserStatus;
}
