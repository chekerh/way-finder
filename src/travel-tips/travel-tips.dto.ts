import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export enum TravelTipCategory {
  GENERAL = 'general',
  TRANSPORTATION = 'transportation',
  ACCOMMODATION = 'accommodation',
  FOOD = 'food',
  CULTURE = 'culture',
  SAFETY = 'safety',
  BUDGET = 'budget',
  WEATHER = 'weather',
}

export class GetTravelTipsDto {
  @IsNotEmpty()
  @IsString()
  destinationId: string;

  @IsOptional()
  @IsEnum(TravelTipCategory)
  category?: TravelTipCategory;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class CreateTravelTipDto {
  @IsString()
  destinationId: string;

  @IsString()
  destinationName: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsEnum(TravelTipCategory)
  category: TravelTipCategory;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  tags?: string[];
}

export class MarkTipHelpfulDto {
  @IsString()
  tipId: string;
}

