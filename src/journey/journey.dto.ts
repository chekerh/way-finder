import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsMongoId,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SlideInputDto {
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  caption?: string;
}

export class CreateJourneyDto {
  @IsOptional()
  @IsMongoId()
  booking_id?: string; // Optional, will be auto-linked if not provided

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  destination?: string; // Destination name (e.g., "Paris, France") - used if provided instead of booking destination

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // If not JSON, try splitting by comma
        return value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  music_theme?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  caption_text?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlideInputDto)
  slides?: SlideInputDto[];
}

export class UpdateJourneyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  music_theme?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  caption_text?: string;
}

export class CreateJourneyCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @IsMongoId()
  parent_comment_id?: string; // For replies
}

