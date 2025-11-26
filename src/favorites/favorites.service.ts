import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './favorites.schema';
import { CreateFavoriteDto } from './favorites.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
  ) {}

  async addFavorite(
    userId: string,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    // Check if already favorited
    const existing = await this.favoriteModel.findOne({
      user_id: userId,
      item_type: createFavoriteDto.item_type,
      item_id: createFavoriteDto.item_id,
    });

    if (existing) {
      throw new ConflictException('Item is already in favorites');
    }

    const favorite = new this.favoriteModel({
      user_id: userId,
      item_type: createFavoriteDto.item_type,
      item_id: createFavoriteDto.item_id,
      item_data: createFavoriteDto.item_data || {},
      favorited_at: new Date(),
    });

    return await favorite.save();
  }

  async removeFavorite(
    userId: string,
    itemType: string,
    itemId: string,
  ): Promise<void> {
    const result = await this.favoriteModel.deleteOne({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Favorite not found');
    }
  }

  async getFavorites(userId: string, itemType?: string): Promise<Favorite[]> {
    const query: any = { user_id: userId };
    if (itemType) {
      query.item_type = itemType;
    }

    return await this.favoriteModel
      .find(query)
      .sort({ favorited_at: -1 })
      .exec();
  }

  async isFavorite(
    userId: string,
    itemType: string,
    itemId: string,
  ): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
    });

    return favorite !== null;
  }

  async getFavoriteCount(userId: string, itemType?: string): Promise<number> {
    const query: any = { user_id: userId };
    if (itemType) {
      query.item_type = itemType;
    }

    return await this.favoriteModel.countDocuments(query).exec();
  }
}
