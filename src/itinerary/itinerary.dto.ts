import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber, ValidateNested, IsDateString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ActivityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class DayPlanDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  @IsOptional()
  activities?: ActivityDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateItineraryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayPlanDto)
  @IsOptional()
  days?: DayPlanDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsNumber()
  @IsOptional()
  totalBudget?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class UpdateItineraryDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayPlanDto)
  @IsOptional()
  days?: DayPlanDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsNumber()
  @IsOptional()
  totalBudget?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

