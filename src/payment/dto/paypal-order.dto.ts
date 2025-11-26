import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class PaypalItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(127)
  name: string;

  @IsNumber()
  @IsPositive()
  unit_amount: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsString()
  currency_code?: string;
}

export class CreatePaypalOrderDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  currency: string;

  @IsUrl()
  returnUrl: string;

  @IsUrl()
  cancelUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(127)
  description?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaypalItemDto)
  items?: PaypalItemDto[];
}
