import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchHistoryService } from './search-history.service';
import {
  CreateSearchHistoryDto,
  UpdateSearchHistoryDto,
  SaveSearchDto,
} from './search-history.dto';

@Controller('search-history')
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async recordSearch(
    @Req() req: any,
    @Body() createSearchDto: CreateSearchHistoryDto,
  ) {
    const search = await this.searchHistoryService.recordSearch(
      req.user.sub,
      createSearchDto,
    );
    const searchObj = (search as any).toObject
      ? (search as any).toObject()
      : search;
    return searchObj;
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent')
  async getRecentSearches(
    @Req() req: any,
    @Query('type') searchType?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const searches = await this.searchHistoryService.getRecentSearches(
      req.user.sub,
      searchType,
      limit ? parseInt(limit, 10) : 20,
      skip ? parseInt(skip, 10) : 0,
    );
    return searches.map((search) => {
      const searchObj = (search as any).toObject
        ? (search as any).toObject()
        : search;
      return searchObj;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved')
  async getSavedSearches(
    @Req() req: any,
    @Query('type') searchType?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const searches = await this.searchHistoryService.getSavedSearches(
      req.user.sub,
      searchType,
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
    return searches.map((search) => {
      const searchObj = (search as any).toObject
        ? (search as any).toObject()
        : search;
      return searchObj;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async saveSearch(
    @Req() req: any,
    @Param('id') searchId: string,
    @Body() saveSearchDto: SaveSearchDto,
  ) {
    const search = await this.searchHistoryService.saveSearch(
      req.user.sub,
      searchId,
      saveSearchDto,
    );
    const searchObj = (search as any).toObject
      ? (search as any).toObject()
      : search;
    return searchObj;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unsave')
  async unsaveSearch(@Req() req: any, @Param('id') searchId: string) {
    const search = await this.searchHistoryService.unsaveSearch(
      req.user.sub,
      searchId,
    );
    const searchObj = (search as any).toObject
      ? (search as any).toObject()
      : search;
    return searchObj;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateSearchHistory(
    @Req() req: any,
    @Param('id') searchId: string,
    @Body() updateDto: UpdateSearchHistoryDto,
  ) {
    const search = await this.searchHistoryService.updateSearchHistory(
      req.user.sub,
      searchId,
      updateDto,
    );
    const searchObj = (search as any).toObject
      ? (search as any).toObject()
      : search;
    return searchObj;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSearchHistory(@Req() req: any, @Param('id') searchId: string) {
    await this.searchHistoryService.deleteSearchHistory(req.user.sub, searchId);
    return { message: 'Search history deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('recent/clear')
  async clearRecentSearches(
    @Req() req: any,
    @Query('type') searchType?: string,
  ) {
    await this.searchHistoryService.clearRecentSearches(
      req.user.sub,
      searchType,
    );
    return { message: 'Recent searches cleared successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getSearchStats(@Req() req: any) {
    return this.searchHistoryService.getSearchStats(req.user.sub);
  }
}
