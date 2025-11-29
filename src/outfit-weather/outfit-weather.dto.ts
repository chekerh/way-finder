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

