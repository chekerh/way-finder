import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsNumber } from 'class-validator';

export class CreateSearchHistoryDto {
  @IsString()
  @IsNotEmpty()
  searchType: string;

  @IsObject()
  @IsNotEmpty()
  searchParams: Record<string, any>;

  @IsString()
  @IsOptional()
  searchQuery?: string;

  @IsBoolean()
  @IsOptional()
  isSaved?: boolean;

  @IsString()
  @IsOptional()
  savedName?: string;
}

export class UpdateSearchHistoryDto {
  @IsBoolean()
  @IsOptional()
  isSaved?: boolean;

  @IsString()
  @IsOptional()
  savedName?: string;
}

export class SaveSearchDto {
  @IsString()
  @IsNotEmpty()
  savedName: string;
}

