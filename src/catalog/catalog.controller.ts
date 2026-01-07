import { Controller, Get, Query, Req, Param, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { HotelsService } from './hotels.service';
import { AmadeusService } from './amadeus.service';
import type { ActivityFeedResponse } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RecommendedQueryDto } from './dto/flight-search.dto';
import type { ExploreSearchDto } from './dto/explore-search.dto';
import type { ActivitySearchDto } from './dto/activity-search.dto';
import type { HotelSearchDto, TripType } from './dto/hotel-search.dto';

/**
 * Catalog Controller
 * Handles flight catalog, recommended flights, explore offers, activities, and hotels
 */
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly hotelsService: HotelsService,
    private readonly amadeusService: AmadeusService,
  ) {}

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

  // ==================== HOTELS ENDPOINTS ====================

  /**
   * Search for hotels by city
   * @query cityCode - IATA city code (e.g., 'PAR' for Paris)
   * @query checkInDate - Check-in date (YYYY-MM-DD)
   * @query checkOutDate - Check-out date (YYYY-MM-DD)
   * @query adults - Number of adults (default: 2)
   * @query tripType - Trip type for smart filtering (business, honeymoon, family, etc.)
   * @query ratings - Minimum star ratings (comma-separated, e.g., "3,4,5")
   * @query limit - Maximum results to return
   * @returns HotelSearchResponse with hotels matching criteria
   */
  @Get('hotels')
  async searchHotels(
    @Query('cityCode') cityCode?: string,
    @Query('cityName') cityName?: string,
    @Query('checkInDate') checkInDate?: string,
    @Query('checkOutDate') checkOutDate?: string,
    @Query('adults') adults?: string,
    @Query('tripType') tripType?: TripType,
    @Query('accommodationType') accommodationType?: string,
    @Query('ratings') ratings?: string,
    @Query('limit') limit?: string,
    @Query('currency') currency?: string,
  ) {
    const searchParams: HotelSearchDto = {
      cityCode: cityCode?.toUpperCase(),
      cityName: cityName,
      checkInDate: checkInDate || this.getDefaultCheckInDate(),
      checkOutDate: checkOutDate || this.getDefaultCheckOutDate(),
      adults: adults ? Number(adults) : 2,
      tripType,
      accommodationType,
      ratings,
      limit: limit ? Number(limit) : 20,
      currency: currency || 'EUR',
    };

    return this.hotelsService.searchHotels(searchParams);
  }

  /**
   * Get hotel offers (rooms and prices) for specific hotels
   * @query hotelIds - Comma-separated hotel IDs
   * @query checkInDate - Check-in date (YYYY-MM-DD)
   * @query checkOutDate - Check-out date (YYYY-MM-DD)
   * @returns HotelOffersResponse with available rooms and prices
   */
  @Get('hotels/offers')
  async getHotelOffers(
    @Query('hotelIds') hotelIds: string,
    @Query('checkInDate') checkInDate: string,
    @Query('checkOutDate') checkOutDate: string,
    @Query('adults') adults?: string,
    @Query('currency') currency?: string,
  ) {
    const ids = hotelIds?.split(',').map((id) => id.trim()) || [];

    return this.hotelsService.getHotelOffers(
      ids,
      checkInDate || this.getDefaultCheckInDate(),
      checkOutDate || this.getDefaultCheckOutDate(),
      adults ? Number(adults) : 2,
      currency || 'EUR',
    );
  }

  /**
   * Get detailed information for a specific hotel
   * @param hotelId - Hotel ID
   * @returns Hotel details with reviews (if available)
   */
  @Get('hotels/:hotelId')
  async getHotelById(@Param('hotelId') hotelId: string) {
    const hotel = await this.hotelsService.getHotelById(hotelId);

    if (!hotel) {
      return { error: 'Hotel not found', hotelId };
    }

    // Enrich with images from free APIs
    const cityCode = hotel.cityCode || 'PAR';
    const enrichedHotel = await this.hotelsService.enrichWithImages(
      hotel,
      cityCode,
    );

    // Get reviews (placeholder for future integration)
    const reviews: any[] = [];

    return {
      hotel: enrichedHotel,
      reviews,
    };
  }

  /**
   * Get reviews for a hotel using Google Place ID
   * @param placeId - Google Place ID
   * @returns Array of reviews
   */
  @Get('hotels/:hotelId/reviews')
  async getHotelReviews(@Query('placeId') placeId: string) {
    if (!placeId) {
      return { reviews: [], message: 'No Google Place ID provided' };
    }

    const reviews = await this.hotelsService.getHotelReviews(placeId);
    return { reviews };
  }

  // Helper methods for default dates
  private getDefaultCheckInDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 14); // 2 weeks from now
    return date.toISOString().split('T')[0];
  }

  private getDefaultCheckOutDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 17); // 2 weeks + 3 days
    return date.toISOString().split('T')[0];
  }

  /**
   * Health check for Amadeus API service
   * @returns Health status and circuit breaker information
   */
  @Get('health/amadeus')
  async getAmadeusHealth() {
    return await this.amadeusService.healthCheck();
  }

  /**
   * Reset Amadeus circuit breaker (admin use)
   */
  @Get('admin/reset-circuit')
  async resetCircuitBreaker() {
    this.amadeusService.resetCircuitBreaker();
    return { message: 'Circuit breaker reset successfully' };
  }

  /**
   * Clear Amadeus flight cache (admin use)
   */
  @Get('admin/clear-cache')
  async clearFlightCache() {
    this.amadeusService.clearFlightCache();
    return { message: 'Flight cache cleared successfully' };
  }

  /**
   * Get detailed Amadeus service statistics
   */
  @Get('admin/stats')
  async getAmadeusStats() {
    const health = await this.amadeusService.healthCheck();
    const circuitStatus = this.amadeusService.getCircuitStatus();
    const cacheStats = this.amadeusService.getCacheStats();

    return {
      health,
      circuitStatus,
      cacheStats,
      timestamp: new Date().toISOString(),
    };
  }
}
