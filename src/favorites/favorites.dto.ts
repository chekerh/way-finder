import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export enum FavoriteItemType {
  FLIGHT = 'flight',
  DESTINATION = 'destination',
  ACTIVITY = 'activity',
  HOTEL = 'hotel',
}

export class CreateFavoriteDto {
  @IsEnum(FavoriteItemType)
  @IsNotEmpty()
  item_type: FavoriteItemType;

  @IsString()
  @IsNotEmpty()
  item_id: string;

  @IsObject()
  @IsOptional()
  item_data?: Record<string, any>;
}

export class FavoriteResponseDto {
  _id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  item_data: Record<string, any>;
  favorited_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

