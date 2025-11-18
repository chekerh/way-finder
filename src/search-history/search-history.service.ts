import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchHistory, SearchHistoryDocument } from './search-history.schema';
import { CreateSearchHistoryDto, UpdateSearchHistoryDto, SaveSearchDto } from './search-history.dto';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectModel(SearchHistory.name) private readonly searchHistoryModel: Model<SearchHistoryDocument>,
  ) {}

  async recordSearch(userId: string, createSearchDto: CreateSearchHistoryDto): Promise<SearchHistory> {
    // Check if a similar search already exists
    const existingSearch = await this.searchHistoryModel.findOne({
      userId,
      searchType: createSearchDto.searchType,
      searchParams: createSearchDto.searchParams,
      isActive: true,
    }).exec();

    if (existingSearch) {
      // Update existing search: increment count and update timestamp
      existingSearch.searchCount += 1;
      existingSearch.lastSearchedAt = new Date();
      existingSearch.searchQuery = createSearchDto.searchQuery || existingSearch.searchQuery;
      if (createSearchDto.isSaved !== undefined) {
        existingSearch.isSaved = createSearchDto.isSaved;
      }
      if (createSearchDto.savedName) {
        existingSearch.savedName = createSearchDto.savedName;
      }
      const savedSearch = await existingSearch.save();
      return savedSearch;
    }

    // Create new search history entry
    const searchHistory = new this.searchHistoryModel({
      userId,
      ...createSearchDto,
      searchCount: 1,
      lastSearchedAt: new Date(),
      isActive: true,
    });

    const savedSearch = await searchHistory.save();
    return savedSearch;
  }

  async getRecentSearches(
    userId: string,
    searchType?: string,
    limit: number = 20,
    skip: number = 0,
  ): Promise<SearchHistory[]> {
    const query: any = { userId, isActive: true };
    if (searchType) {
      query.searchType = searchType;
    }

    return this.searchHistoryModel
      .find(query)
      .sort({ lastSearchedAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getSavedSearches(
    userId: string,
    searchType?: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<SearchHistory[]> {
    const query: any = { userId, isSaved: true, isActive: true };
    if (searchType) {
      query.searchType = searchType;
    }

    return this.searchHistoryModel
      .find(query)
      .sort({ lastSearchedAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async saveSearch(userId: string, searchId: string, saveSearchDto: SaveSearchDto): Promise<SearchHistory> {
    const search = await this.searchHistoryModel.findOne({ _id: searchId, userId, isActive: true }).exec();

    if (!search) {
      throw new NotFoundException('Search history not found');
    }

    search.isSaved = true;
    search.savedName = saveSearchDto.savedName;
    const savedSearch = await search.save();
    return savedSearch;
  }

  async unsaveSearch(userId: string, searchId: string): Promise<SearchHistory> {
    const search = await this.searchHistoryModel.findOne({ _id: searchId, userId, isActive: true }).exec();

    if (!search) {
      throw new NotFoundException('Search history not found');
    }

    search.isSaved = false;
    search.savedName = undefined;
    const savedSearch = await search.save();
    return savedSearch;
  }

  async updateSearchHistory(
    userId: string,
    searchId: string,
    updateDto: UpdateSearchHistoryDto,
  ): Promise<SearchHistory> {
    const search = await this.searchHistoryModel.findOne({ _id: searchId, userId, isActive: true }).exec();

    if (!search) {
      throw new NotFoundException('Search history not found');
    }

    Object.assign(search, updateDto);
    const savedSearch = await search.save();
    return savedSearch;
  }

  async deleteSearchHistory(userId: string, searchId: string): Promise<void> {
    const result = await this.searchHistoryModel.updateOne(
      { _id: searchId, userId },
      { isActive: false },
    ).exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('Search history not found');
    }
  }

  async clearRecentSearches(userId: string, searchType?: string): Promise<void> {
    const query: any = { userId, isSaved: false, isActive: true };
    if (searchType) {
      query.searchType = searchType;
    }

    await this.searchHistoryModel.updateMany(query, { isActive: false }).exec();
  }

  async getSearchStats(userId: string): Promise<{
    totalSearches: number;
    savedSearches: number;
    searchesByType: Record<string, number>;
    mostSearchedDestination?: string;
  }> {
    const [totalSearches, savedSearches, searchesByType] = await Promise.all([
      this.searchHistoryModel.countDocuments({ userId, isActive: true }).exec(),
      this.searchHistoryModel.countDocuments({ userId, isSaved: true, isActive: true }).exec(),
      this.searchHistoryModel.aggregate([
        { $match: { userId: userId as any, isActive: true } },
        { $group: { _id: '$searchType', count: { $sum: 1 } } },
      ]).exec(),
    ]);

    // Get most searched destination
    const destinationSearches = await this.searchHistoryModel
      .find({ userId, searchType: 'flight', isActive: true })
      .select('searchParams.destination')
      .exec();

    const destinationCounts: Record<string, number> = {};
    destinationSearches.forEach((search) => {
      const dest = search.searchParams?.destination;
      if (dest) {
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      }
    });

    const mostSearchedDestination = Object.entries(destinationCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    const searchesByTypeMap: Record<string, number> = {};
    searchesByType.forEach((item: any) => {
      searchesByTypeMap[item._id] = item.count;
    });

    return {
      totalSearches,
      savedSearches,
      searchesByType: searchesByTypeMap,
      mostSearchedDestination,
    };
  }
}

