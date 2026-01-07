import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export enum DiscountType {
  LUGGAGE = 'luggage',
  TAXES = 'taxes',
  SERVICE_FEE = 'service_fee',
  GENERAL = 'general',
}

export enum DiscountStatus {
  AVAILABLE = 'available',
  APPLIED = 'applied',
  EXPIRED = 'expired',
}

export class DiscountDto {
  @IsNotEmpty()
  @IsString()
  discount_id: string;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  type: DiscountType;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  points_required: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percentage: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_discount_amount?: number; // Maximum discount in currency

  @IsNotEmpty()
  @IsEnum(DiscountStatus)
  status: DiscountStatus;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}

export class ApplyDiscountDto {
  @IsNotEmpty()
  @IsString()
  discount_id: string;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  type: DiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  original_amount?: number; // Original amount before discount

  @IsOptional()
  metadata?: Record<string, any>; // Additional context (booking_id, etc.)
}

export class DiscountApplicationResponse {
  success: boolean;
  discount_applied: number;
  points_used: number;
  remaining_points: number;
  final_amount: number;
  transaction_id: string;
  message: string;
}

export class AvailableDiscountsResponse {
  available_discounts: DiscountDto[];
  user_points: number;
  eligible_discounts: DiscountDto[];
}
