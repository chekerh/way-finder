import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateJourneyDto {
  @IsNotEmpty()
  @IsMongoId()
  booking_id?: string; // Optional, will be auto-linked if not provided

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

