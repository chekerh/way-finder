import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import type { ActivityFeedResponse } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RecommendedQueryDto } from './dto/flight-search.dto';
import type { ExploreSearchDto } from './dto/explore-search.dto';
import type { ActivitySearchDto } from './dto/activity-search.dto';

/**
 * Catalog Controller
 * Handles flight catalog, recommended flights, explore offers, and activities
 */
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Get personalized recommended flights for the authenticated user
   * @query RecommendedQueryDto - Flight search parameters (origin, destination, dates, etc.)
   * @returns Array of recommended flight offers
   */
  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  async getRecommended(@Req() req: any, @Query() query: RecommendedQueryDto) {
    const normalized: RecommendedQueryDto = {
      ...query,
      adults: query.adults ? Number(query.adults) : undefined,
      maxResults: query.maxResults ? Number(query.maxResults) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxDuration: query.maxDuration ? Number(query.maxDuration) : undefined,
    };
    return this.catalogService.getRecommendedFlights(req.user.sub, normalized);
  }

  /**
   * Explore flight offers based on search criteria
   * @query ExploreSearchDto - Explore search parameters (origin, destination, dates, budget)
   * @returns Array of flight offers matching the criteria
   */
  @Get('explore')
  async getExplore(@Query() query: ExploreSearchDto) {
    return this.catalogService.getExploreOffers({
      origin: query.origin ?? 'TUN',
      destination: query.destination,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      budget: query.budget ? Number(query.budget) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    });
  }

  /**
   * Get activities feed for a specific city
   * @query ActivitySearchDto - Activity search parameters (city, themes, limit, radius)
   * @returns ActivityFeedResponse with activities matching the criteria
   */
  @Get('activities')
  async getActivities(
    @Query() query: ActivitySearchDto,
  ): Promise<ActivityFeedResponse> {
    const themes =
      typeof query.themes === 'string'
        ? query.themes
            .split(',')
            .map((theme) => theme.trim())
            .filter(Boolean)
        : query.themes;

    return this.catalogService.getActivitiesFeed({
      city: query.city,
      themes,
      limit: query.limit ? Number(query.limit) : undefined,
      radiusMeters: query.radiusMeters ? Number(query.radiusMeters) : undefined,
    });
  }
}
