import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum PointsSource {
  ONBOARDING = 'onboarding',
  BOOKING = 'booking',
  REVIEW = 'review',
  SHARE = 'share',
  STREAK = 'streak',
  ACHIEVEMENT = 'achievement',
  REFERRAL = 'referral',
  BONUS = 'bonus',
}

export enum PointsType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  BONUS = 'bonus',
  PENALTY = 'penalty',
}

export class AwardPointsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  points: number;

  @IsNotEmpty()
  @IsEnum(PointsSource)
  source: PointsSource;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class PointsTransactionResponse {
  transaction_id: string;
  user_id: string;
  points: number;
  total_points: number;
  type: string;
  source: string;
  description?: string;
  transaction_date: Date;
}

export class UserPointsResponse {
  total_points: number;
  available_points: number;
  lifetime_points: number;
  recent_transactions: PointsTransactionResponse[];
}
