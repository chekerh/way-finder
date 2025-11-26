import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsObject,
} from 'class-validator';
import type { NotificationType } from './notifications.schema';

export class CreateNotificationDto {
  @IsEnum([
    'booking_confirmed',
    'booking_cancelled',
    'booking_updated',
    'price_alert',
    'payment_success',
    'payment_failed',
    'trip_reminder',
    'general',
  ])
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsString()
  @IsOptional()
  actionUrl?: string;
}

export class UpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
