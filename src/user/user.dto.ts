import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserStatus } from '../common/enums/user-status.enum';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

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
  onboarding_preferences?: any;
}

export class UserDto {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  preferences: string[];
  status: UserStatus;
}
