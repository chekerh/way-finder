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
import {
  PaginationDto,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

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

  /**
   * Get recent searches with pagination
   * @query type - Optional filter by search type
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @UseGuards(JwtAuthGuard)
  @Get('recent')
  async getRecentSearches(
    @Req() req: any,
    @Query('type') searchType?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = pagination || {};
    const result = await this.searchHistoryService.getRecentSearchesPaginated(
      req.user.sub,
      page,
      limit,
      searchType,
    );

    const data = result.data.map((search) => {
      const searchObj = (search as any).toObject
        ? (search as any).toObject()
        : search;
      return searchObj;
    });

    return createPaginatedResponse(data, result.total, page, limit);
  }

  /**
   * Get saved searches with pagination
   * @query type - Optional filter by search type
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 50, max: 100)
   */
  @UseGuards(JwtAuthGuard)
  @Get('saved')
  async getSavedSearches(
    @Req() req: any,
    @Query('type') searchType?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 50 } = pagination || {};
    const result = await this.searchHistoryService.getSavedSearchesPaginated(
      req.user.sub,
      page,
      limit,
      searchType,
    );

    const data = result.data.map((search) => {
      const searchObj = (search as any).toObject
        ? (search as any).toObject()
        : search;
      return searchObj;
    });

    return createPaginatedResponse(data, result.total, page, limit);
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
