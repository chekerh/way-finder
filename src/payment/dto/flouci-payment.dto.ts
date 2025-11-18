import { IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';

export class CreateFlouciPaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  success_link: string;

  @IsString()
  fail_link: string;

  @IsString()
  @IsOptional()
  app_transaction_id?: string;

  @IsNumber()
  @IsOptional()
  app_transaction_time?: number;

  @IsObject()
  @IsOptional()
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  @IsString()
  @IsOptional()
  webhook?: string;
}

