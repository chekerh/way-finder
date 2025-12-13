import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { AmadeusService, AmadeusRateLimitError } from './amadeus.service';
import { ActivitiesService } from './activities.service';
import type { ActivityFeedResponse } from './activities.service';
import { FlightSearchDto, RecommendedQueryDto } from './dto/flight-search.dto';
import { ExploreSearchDto } from './dto/explore-search.dto';
import { ActivitySearchDto } from './dto/activity-search.dto';
import { UserService } from '../user/user.service';
import { CacheService } from '../common/cache/cache.service';
import {
  FALLBACK_EXPLORE_OFFERS,
  FALLBACK_FLIGHT_OFFERS,
  DESTINATION_DESCRIPTIONS,
} from './catalog.fallback';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);
  private amadeusCooldownUntil = 0;

  constructor(
    private readonly amadeus: AmadeusService,
    private readonly activities: ActivitiesService,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  async getRecommendedFlights(userId: string, overrides: RecommendedQueryDto) {
    // Generate cache key based on user and search parameters
    const cacheKey = this.generateCacheKey('recommended', userId, overrides);

    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for recommended flights: ${cacheKey}`);
      return cachedResult;
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const preferences = (user as any)?.onboarding_preferences ?? {};
    const origin =
      overrides.originLocationCode ??
      preferences.home_airport ??
      preferences.origin ??
      'TUN';

    // If a specific destination is requested, use it
    if (overrides.destinationLocationCode) {
      const search: FlightSearchDto = {
        originLocationCode: origin,
        destinationLocationCode: overrides.destinationLocationCode,
        departureDate: overrides.departureDate ?? this.generateDateString(14),
        returnDate: overrides.returnDate ?? this.generateDateString(21),
        travelClass:
          overrides.travelClass ?? this.mapTravelClass(preferences.travel_type),
        adults: overrides.adults ?? 1,
        currencyCode: overrides.currencyCode ?? preferences.currency ?? 'EUR',
        max: overrides.maxResults ?? 5,
        maxPrice: overrides.maxPrice ?? preferences.budget_cap,
      };

      try {
        const result = await this.amadeus.searchFlights(search);
        // Ajouter les descriptions aux offres de vol
        if (result?.data?.length) {
          const enrichedData = result.data.map((offer: any) => {
            const destinationCode =
              offer.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode;
            if (destinationCode && DESTINATION_DESCRIPTIONS[destinationCode]) {
              return {
                ...offer,
                description: DESTINATION_DESCRIPTIONS[destinationCode],
              };
            }
            return offer;
          });
          const enrichedResult = { ...result, data: enrichedData };
          // Cache for 5 minutes
          try {
            await this.cacheService.set(cacheKey, enrichedResult, 300);
          } catch (error) {
            // Cache failures shouldn't break the response
            this.logger.warn(`Failed to cache enriched result: ${error}`);
          }
          return enrichedResult;
        }
        // Cache empty result for shorter time (2 minutes)
        try {
          await this.cacheService.set(cacheKey, result, 120);
        } catch (error) {
          // Cache failures shouldn't break the response
          this.logger.warn(`Failed to cache empty result: ${error}`);
        }
        return result;
      } catch (error) {
        if (error instanceof AmadeusRateLimitError) {
          this.registerAmadeusRateLimit();
        } else {
          this.registerAmadeusFailure();
        }
        const fallbackResult = this.buildFallbackFlightResponse(
          [overrides.destinationLocationCode],
          overrides.maxResults ?? 5,
        );
        // Cache fallback for shorter time (2 minutes)
        try {
          await this.cacheService.set(cacheKey, fallbackResult, 120);
        } catch (error) {
          // Cache failures shouldn't break the response
          this.logger.warn(`Failed to cache fallback result: ${error}`);
        }
        return fallbackResult;
      }
    }

    // Otherwise, search for multiple popular destinations to provide variety
    // Always include diverse destinations to avoid showing only one city
    // Include destinations from different regions: Europe, Asia, Americas
    const defaultDestinations = [
      'CDG',
      'FCO',
      'BCN',
      'DXB',
      'JFK',
      'LHR',
      'MAD',
      'AMS',
      'ATH',
      'IST',
      'NRT',
      'BKK',
      'SIN',
      'ICN',
    ];
    const popularDestinations =
      preferences.destination_preferences?.length > 0
        ? [
            ...preferences.destination_preferences,
            ...defaultDestinations,
          ].slice(0, 10) // Mix preferences with defaults
        : defaultDestinations;

    const allFlights: any[] = [];
    const totalRequested = overrides.maxResults ?? 15;
    // Increase number of destinations to search for more variety
    const numDestinations = Math.min(5, popularDestinations.length); // Search up to 5 different destinations
    const maxPerDestination = Math.max(
      2,
      Math.floor(totalRequested / numDestinations),
    );

    if (this.shouldUseFallbackFlights()) {
      const fallbackResult = this.buildFallbackFlightResponse(
        popularDestinations,
        totalRequested,
      );
      // Cache fallback for shorter time (2 minutes)
      try {
        await this.cacheService.set(cacheKey, fallbackResult, 120);
      } catch (error) {
        // Cache failures shouldn't break the response
        this.logger.warn(`Failed to cache fallback result: ${error}`);
      }
      return fallbackResult;
    }

    let hadSuccessfulExternalCall = false;

    const searchPromises = popularDestinations
      .slice(0, numDestinations)
      .map(async (dest) => {
        try {
          const search: FlightSearchDto = {
            originLocationCode: origin,
            destinationLocationCode: dest,
            departureDate:
              overrides.departureDate ?? this.generateDateString(14),
            returnDate: overrides.returnDate ?? this.generateDateString(21),
            travelClass:
              overrides.travelClass ??
              this.mapTravelClass(preferences.travel_type),
            adults: overrides.adults ?? 1,
            currencyCode:
              overrides.currencyCode ?? preferences.currency ?? 'EUR',
            max: maxPerDestination,
            maxPrice: overrides.maxPrice ?? preferences.budget_cap,
          };

          const result = await this.amadeus.searchFlights(search);
          if (result?.data?.length) {
            hadSuccessfulExternalCall = true;
            // Ajouter les descriptions aux offres de vol
            return result.data.map((offer: any) => {
              // Extraire le code d'aéroport de destination depuis les segments
              const destinationCode =
                offer.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode;
              if (
                destinationCode &&
                DESTINATION_DESCRIPTIONS[destinationCode]
              ) {
                return {
                  ...offer,
                  description: DESTINATION_DESCRIPTIONS[destinationCode],
                };
              }
              return offer;
            });
          }
          return [];
        } catch (error) {
          if (error instanceof AmadeusRateLimitError) {
            this.registerAmadeusRateLimit();
          } else {
            this.registerAmadeusFailure();
          }
          return [];
        }
      });

    const results = await Promise.all(searchPromises);
    results.forEach((flights) => {
      if (flights.length > 0) {
        allFlights.push(...flights);
      }
    });

    if (!allFlights.length) {
      const fallbackResult = this.buildFallbackFlightResponse(
        popularDestinations,
        totalRequested,
      );
      // Cache fallback for shorter time (2 minutes)
      try {
        await this.cacheService.set(cacheKey, fallbackResult, 120);
      } catch (error) {
        // Cache failures shouldn't break the response
        this.logger.warn(`Failed to cache fallback result: ${error}`);
      }
      return fallbackResult;
    }

    if (hadSuccessfulExternalCall) {
      this.registerAmadeusSuccess();
    }

    const result = { data: allFlights.slice(0, totalRequested), meta: {} };

    // Cache the result for 5 minutes (300 seconds)
    try {
      await this.cacheService.set(cacheKey, result, 300);
      this.logger.debug(`Cached recommended flights: ${cacheKey}`);
    } catch (error) {
      // Cache failures shouldn't break the response
      this.logger.warn(`Failed to cache recommended flights: ${error}`);
    }

    return result;
  }

  async getExploreOffers(params: ExploreSearchDto) {
    // Generate cache key for explore offers
    const cacheKey = this.generateCacheKey('explore', null, params);

    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for explore offers: ${cacheKey}`);
      return cachedResult;
    }

    const origin = (params.origin ?? 'TUN').toUpperCase();
    const max = params.limit ?? 10;
    const budget = params.budget;
    const destination = params.destination?.toUpperCase();

    let offers = FALLBACK_EXPLORE_OFFERS.filter(
      (offer) => offer.flyFrom === origin,
    );

    if (destination) {
      offers = offers.filter((offer) => offer.flyTo === destination);
    }

    if (typeof budget === 'number') {
      offers = offers.filter((offer) => offer.price <= budget);
    }

    if (!offers.length) {
      offers = FALLBACK_EXPLORE_OFFERS;
    }

    const result = {
      data: offers.slice(0, max),
      currency: 'EUR',
      source: 'fallback',
    };

    // Cache for 10 minutes (600 seconds)
    try {
      await this.cacheService.set(cacheKey, result, 600);
      this.logger.debug(`Cached explore offers: ${cacheKey}`);
    } catch (error) {
      // Cache failures shouldn't break the response
      this.logger.warn(`Failed to cache explore offers: ${error}`);
    }

    return result;
  }

  async getActivitiesFeed(
    params: ActivitySearchDto,
  ): Promise<ActivityFeedResponse> {
    return this.activities.findActivities(params);
  }

  private generateDateString(offsetDays: number): string {
    const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }

  private mapTravelClass(travelType?: string) {
    switch (travelType) {
      case 'business':
        return 'BUSINESS';
      case 'luxury':
        return 'FIRST';
      case 'premium':
        return 'PREMIUM_ECONOMY';
      default:
        return 'ECONOMY';
    }
  }

  private shouldUseFallbackFlights(): boolean {
    return (
      !this.amadeus.isConfigured() || Date.now() < this.amadeusCooldownUntil
    );
  }

  private registerAmadeusFailure() {
    // Regular failure: 5 minute cooldown
    this.amadeusCooldownUntil = Date.now() + 5 * 60 * 1000;
  }

  private registerAmadeusRateLimit() {
    // Rate limit (429): 30 minute cooldown to avoid hitting limits again
    this.amadeusCooldownUntil = Date.now() + 30 * 60 * 1000;
  }

  private registerAmadeusSuccess() {
    this.amadeusCooldownUntil = 0;
  }

  /**
   * Generate cache key for catalog endpoints
   * @param type - Cache type (recommended, explore, activities)
   * @param userId - Optional user ID
   * @param params - Search parameters
   * @returns Cache key string
   */
  private generateCacheKey(
    type: string,
    userId: string | null,
    params: any,
  ): string {
    const paramsHash = JSON.stringify(params).replace(/\s+/g, '').slice(0, 100); // Limit hash length
    const userPart = userId ? `:${userId}` : '';
    return `catalog:${type}${userPart}:${paramsHash}`;
  }

  /**
   * Get continent for a destination code
   * @param code - Airport code
   * @returns Continent name (europe, asia, americas)
   */
  private getContinentForDestination(code: string): string {
    const upperCode = code.toUpperCase();
    // Europe destinations
    const europeCodes = ['CDG', 'ORY', 'FCO', 'BCN', 'MAD', 'LHR', 'AMS', 'ATH', 'IST'];
    // Asia destinations
    const asiaCodes = ['DXB', 'NRT', 'BKK', 'SIN', 'ICN'];
    // Americas destinations
    const americasCodes = ['JFK'];

    if (europeCodes.includes(upperCode)) return 'europe';
    if (asiaCodes.includes(upperCode)) return 'asia';
    if (americasCodes.includes(upperCode)) return 'americas';
    return 'unknown';
  }

  private buildFallbackFlightResponse(
    preferredDestinations: string[],
    maxResults?: number,
  ) {
    const normalizedPrefs = preferredDestinations.map((code) =>
      code.toUpperCase(),
    );

    // First, try to get flights matching preferences
    let flights = FALLBACK_FLIGHT_OFFERS.filter((flight) =>
      normalizedPrefs.includes(flight.destinationCode),
    );

    // If we don't have enough variety, add more destinations from fallback
    // Ensure we always have at least 3-5 different destinations
    const uniqueDestinations = flights
      .map((f) => f.destinationCode)
      .filter((v, i, a) => a.indexOf(v) === i);
    const minDestinations = Math.min(5, FALLBACK_FLIGHT_OFFERS.length);

    if (uniqueDestinations.length < minDestinations) {
      // Add more destinations from fallback to ensure variety
      const additionalFlights = FALLBACK_FLIGHT_OFFERS.filter(
        (flight) => !uniqueDestinations.includes(flight.destinationCode),
      );
      flights = [...flights, ...additionalFlights].slice(
        0,
        minDestinations * 2,
      ); // Take up to 2 per destination
    }

    if (!flights.length) {
      flights = FALLBACK_FLIGHT_OFFERS;
    }

    // Ensure we return diverse destinations (at least one per unique destination code)
    const diverseFlights: typeof FALLBACK_FLIGHT_OFFERS = [];
    const seenDestinations = new Set<string>();
    const seenContinents = new Set<string>();

    // First pass: ensure at least one destination from each continent (Europe, Asia, Americas)
    const requiredContinents = ['europe', 'asia', 'americas'];
    for (const continent of requiredContinents) {
      const continentFlight = FALLBACK_FLIGHT_OFFERS.find(
        (flight) =>
          this.getContinentForDestination(flight.destinationCode) ===
            continent && !seenDestinations.has(flight.destinationCode),
      );
      if (continentFlight) {
        diverseFlights.push(continentFlight);
        seenDestinations.add(continentFlight.destinationCode);
        seenContinents.add(continent);
      }
    }

    // Second pass: add flights matching preferences (one per destination)
    for (const flight of flights) {
      if (diverseFlights.length >= (maxResults ?? 15)) break;
      if (!seenDestinations.has(flight.destinationCode)) {
        diverseFlights.push(flight);
        seenDestinations.add(flight.destinationCode);
        const continent = this.getContinentForDestination(flight.destinationCode);
        if (continent !== 'unknown') {
          seenContinents.add(continent);
        }
      }
    }

    // Third pass: add more flights from same destinations if we have space
    for (const flight of flights) {
      if (diverseFlights.length >= (maxResults ?? 15)) break;
      if (
        seenDestinations.has(flight.destinationCode) &&
        diverseFlights.filter(
          (f) => f.destinationCode === flight.destinationCode,
        ).length < 2
      ) {
        diverseFlights.push(flight);
      }
    }

    // Final pass: if we still don't have all continents, add them
    for (const continent of requiredContinents) {
      if (diverseFlights.length >= (maxResults ?? 15)) break;
      if (!seenContinents.has(continent)) {
        const continentFlight = FALLBACK_FLIGHT_OFFERS.find(
          (flight) =>
            this.getContinentForDestination(flight.destinationCode) ===
              continent && !seenDestinations.has(flight.destinationCode),
        );
        if (continentFlight) {
          diverseFlights.push(continentFlight);
          seenDestinations.add(continentFlight.destinationCode);
          seenContinents.add(continent);
        }
      }
    }

    const slice = diverseFlights.slice(0, maxResults ?? diverseFlights.length);

    return {
      data: slice.map((flight) => {
        const offer = { ...flight.offer };
        // Ajouter la description basée sur le code de destination
        const description = DESTINATION_DESCRIPTIONS[flight.destinationCode];
        if (description) {
          offer.description = description;
        }
        return offer;
      }),
      meta: { fallback: true },
    };
  }

  async searchHotels(params: {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    adults?: number;
    tripType?: string;
    ratings?: string;
    limit?: number;
    currency?: string;
  }) {
    // Generate a cache key
    const cacheKey = `hotels_${params.cityCode}_${params.checkInDate}_${params.checkOutDate}_${params.tripType}_${params.limit}`;
    
    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for hotels: ${cacheKey}`);
      return cached;
    }

    // Fallback hotel data - ensure all hotels have an 'id' field
    const fallbackHotels = this.generateFallbackHotels(
      params.cityCode,
      params.tripType,
      params.limit ?? 20,
    );

    const response = {
      data: fallbackHotels,
      meta: {
        count: fallbackHotels.length,
        source: 'fallback',
      },
    };

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  private generateFallbackHotels(
    cityCode: string,
    tripType?: string,
    limit: number = 20,
  ): any[] {
    const baseHotels = [
      {
        id: `hotel_${cityCode}_1`,
        hotelId: `HOTEL_${cityCode}_001`,
        name: 'Grand Hotel Central',
        cityCode: cityCode,
        rating: 4.5,
        type: tripType === 'business' ? 'business' : 'hotel',
        pricePerNight: tripType === 'backpacking' ? 45 : tripType === 'business' ? 150 : 120,
        currency: 'EUR',
        amenities: ['wifi', 'pool', 'restaurant', 'parking'],
        address: {
          lines: ['123 Main Street'],
          cityName: cityCode,
          countryCode: 'FR',
        },
        geoCode: {
          latitude: 48.8566,
          longitude: 2.3522,
        },
        description: 'A comfortable hotel in the heart of the city',
        media: [
          { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', category: 'exterior' },
        ],
        googleRating: 4.5,
        googleReviewCount: 1250,
      },
      {
        id: `hotel_${cityCode}_2`,
        hotelId: `HOTEL_${cityCode}_002`,
        name: 'Boutique Hotel Paris',
        cityCode: cityCode,
        rating: 4.2,
        type: tripType === 'honeymoon' ? 'boutique' : 'hotel',
        pricePerNight: tripType === 'backpacking' ? 55 : 100,
        currency: 'EUR',
        amenities: ['wifi', 'spa', 'restaurant'],
        address: {
          lines: ['456 Avenue des Champs'],
          cityName: cityCode,
          countryCode: 'FR',
        },
        geoCode: {
          latitude: 48.8606,
          longitude: 2.3376,
        },
        description: 'Charming boutique hotel with modern amenities',
        media: [
          { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', category: 'exterior' },
        ],
        googleRating: 4.2,
        googleReviewCount: 890,
      },
      {
        id: `hotel_${cityCode}_3`,
        hotelId: `HOTEL_${cityCode}_003`,
        name: 'Budget Hostel Central',
        cityCode: cityCode,
        rating: 3.8,
        type: tripType === 'backpacking' ? 'hostel' : 'hotel',
        pricePerNight: 35,
        currency: 'EUR',
        amenities: ['wifi', 'breakfast'],
        address: {
          lines: ['789 Backpacker Street'],
          cityName: cityCode,
          countryCode: 'FR',
        },
        geoCode: {
          latitude: 48.8526,
          longitude: 2.3522,
        },
        description: 'Affordable accommodation for budget travelers',
        media: [
          { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', category: 'exterior' },
        ],
        googleRating: 3.8,
        googleReviewCount: 450,
      },
    ];

    // Filter by trip type if specified
    let filtered = baseHotels;
    if (tripType === 'backpacking') {
      filtered = baseHotels.filter((h) => h.type === 'hostel' || h.pricePerNight < 60);
    } else if (tripType === 'business') {
      filtered = baseHotels.filter((h) => h.type === 'business' || h.amenities.includes('wifi'));
    } else if (tripType === 'honeymoon') {
      filtered = baseHotels.filter((h) => h.type === 'boutique' || h.rating >= 4.0);
    }

    // Repeat hotels to reach limit
    const result: any[] = [];
    while (result.length < limit) {
      result.push(...filtered);
    }

    return result.slice(0, limit);
  }

  async getHotelOffers(params: {
    hotelIds: string[];
    checkInDate: string;
    checkOutDate: string;
    adults?: number;
    currency?: string;
  }) {
    return {
      data: params.hotelIds.map((hotelId) => ({
        hotel: {
          id: hotelId,
          hotelId: hotelId,
          name: 'Sample Hotel',
        },
        offers: [],
      })),
      meta: { count: params.hotelIds.length },
    };
  }

  async getHotelById(hotelId: string) {
    return {
      hotel: {
        id: hotelId,
        hotelId: hotelId,
        name: 'Sample Hotel',
        rating: 4.5,
        description: 'A sample hotel description',
      },
      reviews: [],
      error: null,
    };
  }

  async getHotelReviews(hotelId: string, placeId?: string) {
    return {
      reviews: [],
      message: null,
    };
  }
}
