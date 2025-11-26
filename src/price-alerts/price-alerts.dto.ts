import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class CreatePriceAlertDto {
  @IsString()
  @IsNotEmpty()
  alertType: string;

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsObject()
  @IsNotEmpty()
  itemData: Record<string, any>;

  @IsNumber()
  @IsNotEmpty()
  targetPrice: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(['below', 'above'])
  @IsOptional()
  condition?: 'below' | 'above';

  @IsNumber()
  @IsOptional()
  currentPrice?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  sendNotification?: boolean;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;
}

export class UpdatePriceAlertDto {
  @IsNumber()
  @IsOptional()
  targetPrice?: number;

  @IsEnum(['below', 'above'])
  @IsOptional()
  condition?: 'below' | 'above';

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  sendNotification?: boolean;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;
}
