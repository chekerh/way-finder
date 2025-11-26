import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
} from 'class-validator';
import type { ReviewItemType } from './reviews.schema';

export class CreateReviewDto {
  @IsEnum(['flight', 'hotel', 'activity', 'destination'])
  @IsNotEmpty()
  itemType: ReviewItemType;

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  details?: {
    comfort?: number;
    service?: number;
    value?: number;
    punctuality?: number;
    cleanliness?: number;
    location?: number;
    amenities?: number;
    experience?: number;
    guide?: number;
  };
}

export class UpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  details?: {
    comfort?: number;
    service?: number;
    value?: number;
    punctuality?: number;
    cleanliness?: number;
    location?: number;
    amenities?: number;
    experience?: number;
    guide?: number;
  };
}
