import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto, FavoriteItemType } from './favorites.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async addFavorite(
    @Req() req: any,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    return this.favoritesService.addFavorite(req.user.sub, createFavoriteDto);
  }

  @Get()
  async getFavorites(
    @Req() req: any,
    @Query('type') itemType?: FavoriteItemType,
  ) {
    return this.favoritesService.getFavorites(req.user.sub, itemType);
  }

  @Get('count')
  async getFavoriteCount(
    @Req() req: any,
    @Query('type') itemType?: FavoriteItemType,
  ) {
    const count = await this.favoritesService.getFavoriteCount(
      req.user.sub,
      itemType,
    );
    return { count };
  }

  @Get('check/:type/:id')
  async checkFavorite(
    @Req() req: any,
    @Param('type') itemType: string,
    @Param('id') itemId: string,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(
      req.user.sub,
      itemType,
      itemId,
    );
    return { isFavorite };
  }

  @Delete(':type/:id')
  async removeFavorite(
    @Req() req: any,
    @Param('type') itemType: string,
    @Param('id') itemId: string,
  ) {
    await this.favoritesService.removeFavorite(req.user.sub, itemType, itemId);
    return { message: 'Favorite removed successfully' };
  }
}
