import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class AnalyzeOutfitDto {
  @IsString()
  booking_id: string;

  @IsUrl()
  image_url: string;
}

export class ApproveOutfitDto {
  @IsBoolean()
  @IsOptional()
  is_approved?: boolean;
}

export class UploadOutfitDto {
  @IsString()
  booking_id: string;

  @IsString()
  @IsOptional()
  outfit_date?: string; // Date in format YYYY-MM-DD (e.g., "2025-11-30")
}

