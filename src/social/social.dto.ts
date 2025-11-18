import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsEnum, IsObject } from 'class-validator';

export class FollowUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // ID of user to follow
}

export class ShareTripDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['itinerary', 'booking', 'destination', 'custom'])
  @IsNotEmpty()
  tripType: 'itinerary' | 'booking' | 'destination' | 'custom';

  @IsString()
  @IsOptional()
  tripId?: string; // ID of itinerary, booking, etc.

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateSharedTripDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

