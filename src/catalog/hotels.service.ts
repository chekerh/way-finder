import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CacheService } from '../common/cache/cache.service';
import {
  HotelSearchDto,
  HotelSearchResponse,
  HotelOffersResponse,
  Hotel,
  HotelOffer,
  FallbackHotel,
  TripType,
} from './dto/hotel-search.dto';

/**
 * Hotels Service
 * Integrates with Amadeus Hotel Search API for real hotel data
 * Falls back to curated mock data when API is unavailable
 */
@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);
  private cachedToken: string | null = null;
  private tokenExpiry = 0;

  private readonly clientId = process.env.AMADEUS_CLIENT_ID;
  private readonly clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  private readonly host =
    process.env.AMADEUS_HOST ?? 'https://test.api.amadeus.com';
  private readonly pixabayKey = process.env.PIXABAY_API_KEY;

  constructor(
    private readonly http: HttpService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Check if Amadeus credentials are configured
   */
  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Convert city name to IATA city code
   */
  private cityNameToCode(cityName: string): string {
    const cityMappings: Record<string, string> = {
      paris: 'PAR',
      london: 'LON',
      londres: 'LON',
      rome: 'ROM',
      roma: 'ROM',
      barcelona: 'BCN',
      barcelone: 'BCN',
      dubai: 'DXB',
      'new york': 'NYC',
      'new york city': 'NYC',
      nyc: 'NYC',
      tokyo: 'TYO',
      amsterdam: 'AMS',
      madrid: 'MAD',
      berlin: 'BER',
      munich: 'MUC',
      vienna: 'VIE',
      vienne: 'VIE',
      lisbon: 'LIS',
      lisbonne: 'LIS',
      athens: 'ATH',
      athènes: 'ATH',
      istanbul: 'IST',
      bangkok: 'BKK',
      singapore: 'SIN',
      singapour: 'SIN',
      tunis: 'TUN',
      tunisia: 'TUN',
      cairo: 'CAI',
      doha: 'DOH',
      'abu dhabi': 'AUH',
      riyadh: 'RUH',
      jeddah: 'JED',
      mumbai: 'BOM',
      delhi: 'DEL',
      bangalore: 'BLR',
      sydney: 'SYD',
      melbourne: 'MEL',
      toronto: 'YYZ',
      montreal: 'YUL',
      vancouver: 'YVR',
    };

    const normalized = cityName.toLowerCase().trim();

    // Try exact match first
    if (cityMappings[normalized]) {
      return cityMappings[normalized];
    }

    // Try partial match (contains)
    for (const [key, code] of Object.entries(cityMappings)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return code;
      }
    }

    // If it's already a 3-letter code, return uppercase
    if (normalized.length === 3 && /^[A-Za-z]{3}$/.test(normalized)) {
      return normalized.toUpperCase();
    }

    // Fallback to PAR
    return 'PAR';
  }

  /**
   * Get Amadeus access token (cached)
   */
  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiry - 5000) {
      return this.cachedToken;
    }

    if (!this.isConfigured()) {
      throw new InternalServerErrorException(
        'Amadeus credentials are not configured',
      );
    }

    const body = new URLSearchParams();
    body.set('grant_type', 'client_credentials');
    body.set('client_id', this.clientId!);
    body.set('client_secret', this.clientSecret!);

    try {
      const response = await lastValueFrom(
        this.http.post(
          `${this.host}/v1/security/oauth2/token`,
          body.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      this.cachedToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.cachedToken as string;
    } catch (error) {
      this.logger.error('Failed to fetch Amadeus token', error);
      throw new InternalServerErrorException(
        'Failed to authenticate with Amadeus',
      );
    }
  }

  /**
   * Search for hotels by city
   * Uses Amadeus Hotel List API to find hotels in a city
   */
  async searchHotels(params: HotelSearchDto): Promise<HotelSearchResponse> {
    // Convert city name to city code if needed
    let cityCode = params.cityCode;
    if (!cityCode && params.cityName) {
      cityCode = this.cityNameToCode(params.cityName);
      this.logger.debug(
        `Converted city name "${params.cityName}" to city code "${cityCode}"`,
      );
    }
    if (!cityCode) {
      cityCode = 'PAR'; // Default fallback
    }

    // Update params with resolved city code
    const searchParams: HotelSearchDto = {
      ...params,
      cityCode: cityCode.toUpperCase(),
      cityName: undefined, // Clear cityName since we're using cityCode
    };

    const cacheKey = `hotels:search:${JSON.stringify(searchParams)}`;

    // Check cache first
    const cached = await this.cacheService.get<HotelSearchResponse>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for hotel search: ${cityCode}`);
      return cached;
    }

    if (!this.isConfigured()) {
      this.logger.warn('Amadeus not configured, using fallback hotels');
      return this.getFallbackHotels(searchParams);
    }

    try {
      const accessToken = await this.getAccessToken();

      // Step 1: Get hotel IDs by city
      const hotelListUrl = `${this.host}/v1/reference-data/locations/hotels/by-city`;
      const hotelListResponse = await lastValueFrom(
        this.http.get(hotelListUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            cityCode: cityCode.toUpperCase(),
            radius: 50,
            radiusUnit: 'KM',
            hotelSource: 'ALL',
          },
        }),
      );

      const rawHotels = hotelListResponse.data?.data || [];

      // Map Amadeus hotels to ensure they have 'id' field (required by Android)
      // Amadeus provides real hotel names and data, so we preserve them
      // Map and normalize Amadeus hotels
      let hotels: Hotel[] = rawHotels.map((hotel: any) => {
        const hotelName = (
          hotel.name ||
          hotel.hotelName ||
          `Hotel ${hotel.hotelId}`
        ).toLowerCase();

        // Infer accommodation type from hotel name and characteristics
        let inferredType = 'HOTEL'; // Default
        if (
          hotelName.includes('resort') ||
          hotelName.includes('spa') ||
          hotelName.includes('beach')
        ) {
          inferredType = 'RESORT';
        } else if (
          hotelName.includes('hostel') ||
          hotelName.includes('backpacker')
        ) {
          inferredType = 'HOSTEL';
        } else if (
          hotelName.includes('apartment') ||
          hotelName.includes('apart') ||
          hotelName.includes('suite')
        ) {
          inferredType = 'APARTMENT';
        } else if (hotelName.includes('airbnb') || hotelName.includes('bnb')) {
          inferredType = 'APARTMENT'; // Airbnb-like properties
        }

        return {
          ...hotel,
          id:
            hotel.id ||
            hotel.hotelId ||
            `hotel-${hotel.hotelId || Date.now()}-${Math.random()}`,
          hotelId: hotel.hotelId || hotel.id || '',
          // Preserve real hotel name from Amadeus (don't override)
          name: hotel.name || hotel.hotelName || `Hotel ${hotel.hotelId}`,
          // Infer type from name or use provided type
          type: hotel.type || inferredType,
          // Set default pricePerNight if missing (for fallback compatibility)
          pricePerNight:
            hotel.pricePerNight ||
            (hotel.price?.base ? parseFloat(hotel.price.base) : undefined),
          currency: hotel.currency || hotel.price?.currency || 'EUR',
          // Preserve any media/images from Amadeus if available
          media: hotel.media || hotel.images || undefined,
        };
      });

      // Filter out obvious test/sandbox properties from Amadeus (e.g. "HN TEST PROPERTY1 FOR E2E TESTING")
      hotels = hotels.filter((h) => {
        const name = (h.name || '').toLowerCase();
        return (
          !name.includes('test property') &&
          !name.includes('e2e testing') &&
          !name.includes('sandbox')
        );
      });

      // Apply accommodation type filtering (hotel, airbnb, hostel, resort, apartment)
      if (params.accommodationType) {
        hotels = this.filterByAccommodationType(
          hotels,
          params.accommodationType,
        );
      }

      // Apply trip type filtering
      if (params.tripType) {
        hotels = this.filterByTripType(hotels, params.tripType);
      }

      // Apply rating filter
      if (params.ratings) {
        const minRating = Math.min(...params.ratings.split(',').map(Number));
        hotels = hotels.filter((h) => (h.rating || 0) >= minRating);
      }

      // Limit results
      const limit = params.limit || 20;
      hotels = hotels.slice(0, limit);

      // If no hotels found from Amadeus, fall back to mock data
      if (hotels.length === 0) {
        this.logger.warn(
          `No hotels found from Amadeus for ${params.cityCode}, using fallback hotels`,
        );
        const fallbackResult = this.getFallbackHotels(params);
        // Cache the fallback result instead of empty result
        await this.cacheService.set(cacheKey, fallbackResult, 1800);
        return fallbackResult;
      }

      // Ensure all hotels have required 'id' field before returning
      let mappedHotels: Hotel[] = hotels.map((h) => ({
        ...h,
        id:
          h.id ||
          h.hotelId ||
          `hotel-${h.hotelId || Date.now()}-${Math.random()}`,
        hotelId: h.hotelId || h.id || '',
      }));

      // Enrich hotels with images from free APIs (Pixabay/Unsplash)
      this.logger.debug(`Enriching ${mappedHotels.length} hotels with images`);
      mappedHotels = await Promise.all(
        mappedHotels.map((hotel) =>
          this.enrichWithImages(
            hotel,
            cityCode,
            params.tripType,
            params.accommodationType,
          ),
        ),
      );

      const result: HotelSearchResponse = {
        data: mappedHotels,
        meta: {
          count: mappedHotels.length,
          source: 'amadeus',
        },
      };

      // Cache for 30 minutes (only cache non-empty results)
      await this.cacheService.set(cacheKey, result, 1800);

      return result;
    } catch (error) {
      this.logger.error('Failed to search hotels from Amadeus', error);
      return this.getFallbackHotels(params);
    }
  }

  /**
   * Get hotel offers (rooms and prices) for specific hotels
   * Uses Amadeus Hotel Offers API
   */
  async getHotelOffers(
    hotelIds: string[],
    checkInDate: string,
    checkOutDate: string,
    adults: number = 2,
    currency: string = 'EUR',
  ): Promise<HotelOffersResponse> {
    const cacheKey = `hotels:offers:${hotelIds.join(',')}:${checkInDate}:${checkOutDate}`;

    const cached = await this.cacheService.get<HotelOffersResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isConfigured()) {
      return this.getFallbackOffers(hotelIds, checkInDate, checkOutDate);
    }

    try {
      const accessToken = await this.getAccessToken();

      const offersUrl = `${this.host}/v3/shopping/hotel-offers`;
      const response = await lastValueFrom(
        this.http.get(offersUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            hotelIds: hotelIds.slice(0, 20).join(','), // API limit
            checkInDate,
            checkOutDate,
            adults,
            currency,
            roomQuantity: 1,
            bestRateOnly: true,
          },
        }),
      );

      const result: HotelOffersResponse = {
        data: response.data?.data || [],
        meta: {
          count: response.data?.data?.length || 0,
        },
      };

      // Cache for 15 minutes (prices change frequently)
      await this.cacheService.set(cacheKey, result, 900);

      return result;
    } catch (error) {
      this.logger.error('Failed to get hotel offers from Amadeus', error);
      return this.getFallbackOffers(hotelIds, checkInDate, checkOutDate);
    }
  }

  /**
   * Get detailed information for a single hotel
   */
  async getHotelById(hotelId: string): Promise<Hotel | null> {
    const cacheKey = `hotels:detail:${hotelId}`;

    const cached = await this.cacheService.get<Hotel>(cacheKey);
    if (cached) {
      return cached;
    }

    // For now, return from fallback data or search result
    // Amadeus doesn't have a direct hotel detail endpoint in free tier
    const fallback = FALLBACK_HOTELS.find((h) => h.hotelId === hotelId);
    if (fallback) {
      await this.cacheService.set(cacheKey, fallback, 3600);
      return fallback;
    }

    return null;
  }

  /**
   * Enrich hotel with images from free APIs (Pixabay, Unsplash)
   * Uses trip type and accommodation type to generate appropriate image keywords
   */
  async enrichWithImages(
    hotel: Hotel,
    cityCode: string,
    tripType?: TripType,
    accommodationType?: string,
  ): Promise<Hotel> {
    // If hotel already has media, keep it
    if (hotel.media && hotel.media.length > 0) {
      return hotel;
    }

    try {
      const cityName = hotel.address?.cityName || cityCode;
      
      // Generate appropriate image keywords based on trip type and accommodation type
      const imageKeywords = this.getImageKeywords(
        tripType,
        accommodationType,
        cityName,
        hotel.name,
      );
      
      const searchQuery = `${hotel.name} ${cityName} ${imageKeywords}`.trim();

      // Try Pixabay first if API key is available
      if (this.pixabayKey) {
        try {
          const pixabayUrl = 'https://pixabay.com/api/';
          const pixabayResponse = await lastValueFrom(
            this.http.get(pixabayUrl, {
              params: {
                key: this.pixabayKey,
                q: searchQuery,
                image_type: 'photo',
                category: 'travel',
                per_page: 5,
                safesearch: 'true',
              },
            }),
          );

          const hits = pixabayResponse.data?.hits || [];
          if (hits.length > 0) {
            const media = hits.slice(0, 5).map((hit: any, index: number) => ({
              uri: hit.largeImageURL || hit.webformatURL,
              category: index === 0 ? 'EXTERIOR' : 'INTERIOR',
            }));
            hotel.media = media;
            this.logger.debug(
              `Found ${media.length} images from Pixabay for ${hotel.name}`,
            );
            return hotel;
          }
        } catch (error) {
          this.logger.debug('Pixabay API failed, trying Unsplash', error);
        }
      }

      // Fallback to Unsplash Source API (no API key needed)
      // Use direct image URLs based on search terms
      const unsplashKeywords = `${cityName} ${imageKeywords}`.replace(/\s+/g, ',');
      hotel.media = [
        {
          uri: `https://source.unsplash.com/800x600/?${unsplashKeywords}`,
          category: 'EXTERIOR',
        },
        {
          uri: `https://source.unsplash.com/800x600/?${imageKeywords},room,${cityName.replace(/\s+/g, ',')}`,
          category: 'INTERIOR',
        },
      ];

      return hotel;
    } catch (error) {
      this.logger.warn('Failed to enrich hotel with images', error);
      // Return hotel with default image using appropriate keywords
      if (!hotel.media || hotel.media.length === 0) {
        const cityName = hotel.address?.cityName || 'hotel';
        const imageKeywords = this.getImageKeywords(
          tripType,
          accommodationType,
          cityName,
          hotel.name,
        );
        const fallbackKeywords = `${imageKeywords},${cityName}`.replace(/\s+/g, ',');
        hotel.media = [
          {
            uri: `https://source.unsplash.com/800x600/?${fallbackKeywords}`,
            category: 'EXTERIOR',
          },
        ];
      }
      return hotel;
    }
  }

  /**
   * Get appropriate image keywords based on trip type and accommodation type
   */
  private getImageKeywords(
    tripType?: TripType,
    accommodationType?: string,
    cityName?: string,
    hotelName?: string,
  ): string {
    // Priority: trip type > accommodation type > default
    if (tripType) {
      const tripTypeKeywords: Record<TripType, string> = {
        adventure: 'eco lodge mountain cabin hiking nature outdoor adventure accommodation',
        business: 'business hotel conference hotel modern hotel corporate hotel',
        honeymoon: 'romantic hotel boutique hotel luxury hotel spa resort',
        family: 'family hotel family resort kids friendly hotel',
        leisure: 'hotel resort vacation',
        solo: 'hostel budget hotel backpacker accommodation',
        wellness: 'spa resort wellness hotel yoga retreat',
        backpacking: 'hostel backpacker accommodation budget accommodation',
      };
      return tripTypeKeywords[tripType] || 'hotel';
    }

    if (accommodationType) {
      const accTypeKeywords: Record<string, string> = {
        hotel: 'hotel',
        airbnb: 'apartment airbnb',
        hostel: 'hostel backpacker',
        resort: 'resort luxury',
        apartment: 'apartment',
      };
      return accTypeKeywords[accommodationType.toLowerCase()] || 'hotel';
    }

    return 'hotel';
  }

  /**
   * Get reviews for a hotel (placeholder - can be extended with other review sources)
   */
  async getHotelReviews(placeId: string): Promise<any[]> {
    // Placeholder for future review integration
    // Could use TripAdvisor API, Booking.com API, or other free sources
    return [];
  }

  /**
   * Filter hotels by accommodation type (hotel, airbnb, hostel, resort, apartment)
   * Improved filtering logic to better match each accommodation type
   */
  private filterByAccommodationType(
    hotels: Hotel[],
    accommodationType: string,
  ): Hotel[] {
    const typeLower = accommodationType.toLowerCase();
    const typeMap: Record<string, string[]> = {
      hotel: ['HOTEL'],
      airbnb: ['APARTMENT', 'HOTEL'], // Airbnb-like properties are often apartments or small hotels
      hostel: ['HOSTEL'],
      resort: ['RESORT'],
      apartment: ['APARTMENT'],
    };

    const allowedTypes = typeMap[typeLower] || ['HOTEL'];

    return hotels.filter((h) => {
      const hotelType = (h as any).type?.toUpperCase();
      const hotelName = (h.name || '').toLowerCase();
      const rating = h.rating || 0;
      const amenities = h.amenities || [];

      // First, check explicit type match
      if (hotelType && allowedTypes.includes(hotelType)) {
        return true;
      }

      // For each accommodation type, apply specific filtering logic
      switch (typeLower) {
        case 'hotel':
          // Include all hotels (default)
          return (
            !hotelType ||
            hotelType === 'HOTEL' ||
            !['HOSTEL', 'RESORT', 'APARTMENT'].includes(hotelType)
          );

        case 'airbnb':
        case 'apartment':
          // Include apartments, or hotels with apartment-like names/characteristics
          if (hotelType === 'APARTMENT') return true;
          if (
            hotelName.includes('apartment') ||
            hotelName.includes('apart') ||
            hotelName.includes('suite') ||
            hotelName.includes('studio') ||
            hotelName.includes('airbnb') ||
            hotelName.includes('bnb')
          ) {
            return true;
          }
          // Include smaller hotels (lower rating might indicate smaller properties)
          return rating <= 4 && rating > 0;

        case 'hostel':
          // Include hostels, or budget hotels with shared facilities
          if (hotelType === 'HOSTEL') return true;
          if (
            hotelName.includes('hostel') ||
            hotelName.includes('backpacker') ||
            hotelName.includes('youth') ||
            hotelName.includes('dormitory')
          ) {
            return true;
          }
          // Budget hotels (lower rating, lower price)
          if (rating <= 3 && rating > 0) return true;
          // Hotels with shared facilities
          if (
            amenities.some((a: string) =>
              ['SHARED_KITCHEN', 'DORMITORY', 'COMMON_ROOM'].includes(
                a.toUpperCase(),
              ),
            )
          ) {
            return true;
          }
          return false;

        case 'resort':
          // Include resorts, or hotels with resort-like amenities
          if (hotelType === 'RESORT') return true;
          if (
            hotelName.includes('resort') ||
            hotelName.includes('spa') ||
            hotelName.includes('beach') ||
            hotelName.includes('golf')
          ) {
            return true;
          }
          // Hotels with resort amenities (pool, spa, beach access, etc.)
          const resortAmenities = [
            'POOL',
            'SPA',
            'BEACH_ACCESS',
            'GOLF',
            'TENNIS',
            'FITNESS_CENTER',
            'RESTAURANT',
            'BAR',
          ];
          if (
            amenities.some((a: string) =>
              resortAmenities.some((ra) => a.toUpperCase().includes(ra)),
            )
          ) {
            return true;
          }
          // Higher-rated hotels are more likely to be resorts
          if (rating >= 4) return true;
          return false;

        default:
          // Default: include all
          return true;
      }
    });
  }

  /**
   * Filter hotels by trip type
   * Filters accommodations to show appropriate types for each trip type
   */
  private filterByTripType(hotels: Hotel[], tripType: TripType): Hotel[] {
    const filters: Record<TripType, (h: Hotel) => boolean> = {
      business: (h) => {
        const hotelName = (h.name || '').toLowerCase();
        const hotelDesc = (h.description || '').toLowerCase();
        const hotelType = ((h as any).type || '').toUpperCase();
        const amenities = (h.amenities || []).map((a: string) => a.toUpperCase());
        
        // Business hotels: business center, meeting rooms, conference facilities
        return (
          hotelName.includes('business') ||
          hotelName.includes('conference') ||
          hotelName.includes('executive') ||
          hotelName.includes('corporate') ||
          hotelDesc.includes('business') ||
          hotelDesc.includes('conference') ||
          amenities.some((a: string) =>
            ['BUSINESS_CENTER', 'MEETING_ROOMS', 'CONFERENCE', 'WIFI'].includes(a),
          ) ||
          amenities.some((a: string) => a.includes('BUSINESS')) ||
          amenities.some((a: string) => a.includes('MEETING')) ||
          (h.rating || 0) >= 3.5 // Higher-rated hotels more likely to have business facilities
        );
      },
      honeymoon: (h) => {
        const hotelName = (h.name || '').toLowerCase();
        const hotelDesc = (h.description || '').toLowerCase();
        const hotelType = ((h as any).type || '').toUpperCase();
        const amenities = (h.amenities || []).map((a: string) => a.toUpperCase());
        
        // Romantic/boutique hotels: spa, pool, luxury, boutique
        return (
          hotelName.includes('boutique') ||
          hotelName.includes('romantic') ||
          hotelName.includes('luxury') ||
          hotelName.includes('spa') ||
          hotelDesc.includes('romantic') ||
          hotelDesc.includes('boutique') ||
          hotelDesc.includes('luxury') ||
          hotelType === 'RESORT' ||
          amenities.some((a: string) =>
            ['SPA', 'POOL', 'RESTAURANT', 'ROMANTIC'].includes(a),
          ) ||
          (h.rating || 0) >= 4.0 // Higher-rated for romantic getaways
        );
      },
      family: (h) => {
        const hotelName = (h.name || '').toLowerCase();
        const hotelDesc = (h.description || '').toLowerCase();
        const amenities = (h.amenities || []).map((a: string) => a.toUpperCase());
        
        // Family-friendly hotels: family rooms, playground, kids activities
        return (
          hotelName.includes('family') ||
          hotelName.includes('kids') ||
          hotelName.includes('children') ||
          hotelDesc.includes('family') ||
          hotelDesc.includes('kids') ||
          amenities.some((a: string) =>
            ['FAMILY_ROOMS', 'PLAYGROUND', 'KIDS_CLUB', 'POOL'].includes(a),
          ) ||
          amenities.some((a: string) => a.includes('FAMILY')) ||
          amenities.some((a: string) => a.includes('KIDS')) ||
          true // Include all hotels for family (most hotels are family-friendly)
        );
      },
      adventure: (h) => {
        const hotelName = (h.name || '').toLowerCase();
        const hotelDesc = (h.description || '').toLowerCase();
        const hotelType = ((h as any).type || '').toUpperCase();
        const amenities = (h.amenities || []).map((a: string) => a.toUpperCase());
        
        // Adventure: eco-lodges, hostels, nature-focused, hiking-friendly
        return (
          hotelName.includes('eco') ||
          hotelName.includes('lodge') ||
          hotelName.includes('mountain') ||
          hotelName.includes('hiking') ||
          hotelName.includes('adventure') ||
          hotelName.includes('outdoor') ||
          hotelName.includes('nature') ||
          hotelName.includes('hostel') ||
          hotelName.includes('backpacker') ||
          hotelDesc.includes('eco') ||
          hotelDesc.includes('lodge') ||
          hotelDesc.includes('mountain') ||
          hotelDesc.includes('hiking') ||
          hotelDesc.includes('adventure') ||
          hotelDesc.includes('outdoor') ||
          hotelDesc.includes('nature') ||
          hotelType === 'HOSTEL' ||
          amenities.some((a: string) =>
            ['BIKE_RENTAL', 'GUIDED_TOURS', 'OUTDOOR_ACTIVITIES', 'HIKING'].includes(a),
          ) ||
          amenities.some((a: string) => a.includes('BIKE')) ||
          amenities.some((a: string) => a.includes('TOUR')) ||
          (h.rating || 0) <= 4.5 // Adventure accommodations are often more rustic
        );
      },
      leisure: (h) => {
        // Leisure: all types of accommodations
        return true;
      },
      solo: (h) => {
        const hotelName = (h.name || '').toLowerCase();
        const hotelType = ((h as any).type || '').toUpperCase();
        
        // Solo: hostels, budget hotels, apartments (budget-friendly)
        return (
          hotelType === 'HOSTEL' ||
          hotelType === 'APARTMENT' ||
          hotelName.includes('hostel') ||
          hotelName.includes('budget') ||
          (h.rating || 0) <= 4.0 || // Budget-friendly options
          !h.rating
        );
      },
      wellness: (h) => {
        const hotelName = (h.name || '').toLowerCase();
        const hotelDesc = (h.description || '').toLowerCase();
        const amenities = (h.amenities || []).map((a: string) => a.toUpperCase());
        
        // Wellness: spa, gym, pool, sauna, wellness center
        return (
          hotelName.includes('spa') ||
          hotelName.includes('wellness') ||
          hotelName.includes('yoga') ||
          hotelName.includes('meditation') ||
          hotelDesc.includes('spa') ||
          hotelDesc.includes('wellness') ||
          hotelDesc.includes('yoga') ||
          amenities.some((a: string) =>
            ['SPA', 'GYM', 'POOL', 'SAUNA', 'WELLNESS_CENTER', 'FITNESS'].includes(a),
          ) ||
          amenities.some((a: string) => a.includes('SPA')) ||
          amenities.some((a: string) => a.includes('WELLNESS')) ||
          (h.rating || 0) >= 3.5
        );
      },
      backpacking: (h) => {
        const hotelName = (h.name || '').toLowerCase();
        const hotelType = ((h as any).type || '').toUpperCase();
        const amenities = (h.amenities || []).map((a: string) => a.toUpperCase());
        
        // Backpacking: hostels, budget hotels, shared accommodations
        return (
          hotelType === 'HOSTEL' ||
          hotelName.includes('hostel') ||
          hotelName.includes('backpacker') ||
          hotelName.includes('budget') ||
          hotelName.includes('youth') ||
          hotelName.includes('dormitory') ||
          amenities.some((a: string) =>
            ['SHARED_KITCHEN', 'DORMITORY', 'COMMON_ROOM'].includes(a),
          ) ||
          (h.rating || 0) <= 4.0 || // Budget options
          !h.rating
        );
      },
    };

    const filterFn = filters[tripType] || (() => true);
    const filtered = hotels.filter(filterFn);

    // If filtering results in empty list, return all hotels instead
    if (filtered.length === 0 && hotels.length > 0) {
      this.logger.warn(
        `Trip type filter '${tripType}' filtered out all hotels, returning all hotels instead`,
      );
      return hotels;
    }

    return filtered;
  }

  /**
   * Get fallback hotels when API is unavailable
   */
  private getFallbackHotels(params: HotelSearchDto): HotelSearchResponse {
    const cityCode = params.cityCode || 'PAR';
    let hotels = FALLBACK_HOTELS.filter(
      (h) => h.cityCode.toUpperCase() === cityCode.toUpperCase(),
    );

    if (!hotels.length) {
      // Return generic hotels if city not found
      hotels = FALLBACK_HOTELS.slice(0, params.limit || 10);
    }

    if (params.accommodationType) {
      hotels = this.filterByAccommodationType(
        hotels,
        params.accommodationType,
      ) as FallbackHotel[];
    }

    if (params.tripType) {
      hotels = this.filterByTripType(
        hotels,
        params.tripType,
      ) as FallbackHotel[];
    }

    // Explicitly map to ensure all required fields are present (especially 'id')
    const mappedHotels: Hotel[] = hotels
      .slice(0, params.limit || 20)
      .map((h) => ({
        id: h.id || h.hotelId || `fallback-${h.hotelId}`,
        hotelId: h.hotelId,
        name: h.name,
        cityCode: h.cityCode,
        address: h.address,
        geoCode: h.geoCode,
        rating: h.rating,
        amenities: h.amenities,
        media: h.media,
        description: h.description,
        googleRating: h.googleRating,
        googleReviewCount: h.googleReviewCount,
        googlePlaceId: h.googlePlaceId,
        // Include fallback-specific fields
        type: (h as any).type || 'HOTEL',
        pricePerNight: (h as any).pricePerNight,
        currency: (h as any).currency || 'EUR',
      }));

    return {
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        source: 'fallback',
      },
    };
  }

  /**
   * Get fallback offers when API is unavailable
   */
  private getFallbackOffers(
    hotelIds: string[],
    checkInDate: string,
    checkOutDate: string,
  ): HotelOffersResponse {
    const nights = this.calculateNights(checkInDate, checkOutDate);

    const offers = hotelIds
      .map((hotelId) => {
        const hotel = FALLBACK_HOTELS.find((h) => h.hotelId === hotelId);
        if (!hotel) return null;

        const basePrice = hotel.pricePerNight || 100;
        const totalPrice = basePrice * nights;

        return {
          hotel,
          offers: [
            {
              id: `offer-${hotelId}-1`,
              hotelId,
              roomType: 'STANDARD',
              roomDescription: 'Standard Room with city view',
              bedType: 'DOUBLE',
              price: {
                currency: hotel.currency || 'EUR',
                base: basePrice.toFixed(2),
                total: totalPrice.toFixed(2),
              },
              guests: { adults: 2 },
            },
            {
              id: `offer-${hotelId}-2`,
              hotelId,
              roomType: 'DELUXE',
              roomDescription: 'Deluxe Room with premium amenities',
              bedType: 'KING',
              price: {
                currency: hotel.currency || 'EUR',
                base: (basePrice * 1.5).toFixed(2),
                total: (totalPrice * 1.5).toFixed(2),
              },
              guests: { adults: 2 },
            },
          ] as HotelOffer[],
        };
      })
      .filter(Boolean);

    return {
      data: offers as any[],
      meta: { count: offers.length },
    };
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}

/**
 * Fallback hotel data for when Amadeus API is unavailable
 */
const FALLBACK_HOTELS: FallbackHotel[] = [
  // Paris Hotels
  {
    id: 'PAR-001',
    hotelId: 'HLPAR001',
    name: 'Hôtel Le Marais',
    cityCode: 'PAR',
    rating: 4,
    type: 'HOTEL',
    pricePerNight: 180,
    currency: 'EUR',
    amenities: [
      'WIFI',
      'RESTAURANT',
      'BAR',
      'ROOM_SERVICE',
      'AIR_CONDITIONING',
    ],
    address: {
      lines: ['15 Rue de Rivoli'],
      cityName: 'Paris',
      countryCode: 'FR',
    },
    geoCode: { latitude: 48.8566, longitude: 2.3522 },
    description: 'Charming hotel in the heart of Le Marais district',
    googleRating: 4.5,
    googleReviewCount: 1250,
  },
  {
    id: 'PAR-002',
    hotelId: 'HLPAR002',
    name: 'Ibis Paris Montmartre',
    cityCode: 'PAR',
    rating: 3,
    type: 'HOTEL',
    pricePerNight: 95,
    currency: 'EUR',
    amenities: ['WIFI', 'BAR', 'AIR_CONDITIONING'],
    address: {
      lines: ['5 Rue Caulaincourt'],
      cityName: 'Paris',
      countryCode: 'FR',
    },
    geoCode: { latitude: 48.8867, longitude: 2.3431 },
    description: 'Affordable comfort near Sacré-Cœur',
    googleRating: 4.1,
    googleReviewCount: 890,
  },
  {
    id: 'PAR-003',
    hotelId: 'HLPAR003',
    name: 'Shangri-La Paris',
    cityCode: 'PAR',
    rating: 5,
    type: 'RESORT',
    pricePerNight: 650,
    currency: 'EUR',
    amenities: [
      'WIFI',
      'POOL',
      'SPA',
      'RESTAURANT',
      'BAR',
      'GYM',
      'ROOM_SERVICE',
    ],
    address: {
      lines: ["10 Avenue d'Iéna"],
      cityName: 'Paris',
      countryCode: 'FR',
    },
    geoCode: { latitude: 48.8638, longitude: 2.2935 },
    description: 'Luxury palace with Eiffel Tower views',
    googleRating: 4.8,
    googleReviewCount: 2100,
  },
  {
    id: 'PAR-004',
    hotelId: 'HLPAR004',
    name: 'Generator Paris',
    cityCode: 'PAR',
    rating: 2,
    type: 'HOSTEL',
    pricePerNight: 35,
    currency: 'EUR',
    amenities: ['WIFI', 'BAR', 'SHARED_KITCHEN'],
    address: {
      lines: ['9 Place du Colonel Fabien'],
      cityName: 'Paris',
      countryCode: 'FR',
    },
    geoCode: { latitude: 48.8769, longitude: 2.3699 },
    description: 'Trendy hostel for backpackers and solo travelers',
    googleRating: 4.2,
    googleReviewCount: 3500,
  },
  // Rome Hotels
  {
    id: 'ROM-001',
    hotelId: 'HLROM001',
    name: 'Hotel Roma Centro',
    cityCode: 'ROM',
    rating: 4,
    type: 'HOTEL',
    pricePerNight: 150,
    currency: 'EUR',
    amenities: ['WIFI', 'RESTAURANT', 'BAR', 'TERRACE'],
    address: {
      lines: ['Via del Corso 123'],
      cityName: 'Rome',
      countryCode: 'IT',
    },
    geoCode: { latitude: 41.9028, longitude: 12.4964 },
    description: 'Elegant hotel steps from the Trevi Fountain',
    googleRating: 4.4,
    googleReviewCount: 980,
  },
  {
    id: 'ROM-002',
    hotelId: 'HLROM002',
    name: 'Rome Cavalieri Waldorf Astoria',
    cityCode: 'ROM',
    rating: 5,
    type: 'RESORT',
    pricePerNight: 450,
    currency: 'EUR',
    amenities: ['WIFI', 'POOL', 'SPA', 'RESTAURANT', 'GYM', 'TENNIS'],
    address: {
      lines: ['Via Alberto Cadlolo 101'],
      cityName: 'Rome',
      countryCode: 'IT',
    },
    geoCode: { latitude: 41.9241, longitude: 12.4388 },
    description: 'Hilltop luxury resort with panoramic city views',
    googleRating: 4.7,
    googleReviewCount: 1800,
  },
  // Barcelona Hotels
  {
    id: 'BCN-001',
    hotelId: 'HLBCN001',
    name: 'Hotel Arts Barcelona',
    cityCode: 'BCN',
    rating: 5,
    type: 'HOTEL',
    pricePerNight: 380,
    currency: 'EUR',
    amenities: ['WIFI', 'POOL', 'SPA', 'RESTAURANT', 'BAR', 'BEACH_ACCESS'],
    address: {
      lines: ['Carrer de la Marina 19'],
      cityName: 'Barcelona',
      countryCode: 'ES',
    },
    geoCode: { latitude: 41.3851, longitude: 2.1734 },
    description: 'Iconic beachfront tower with stunning Mediterranean views',
    googleRating: 4.6,
    googleReviewCount: 2300,
  },
  {
    id: 'BCN-002',
    hotelId: 'HLBCN002',
    name: 'Casa Camper Barcelona',
    cityCode: 'BCN',
    rating: 4,
    type: 'HOTEL',
    pricePerNight: 220,
    currency: 'EUR',
    amenities: ['WIFI', 'RESTAURANT', 'BAR', 'TERRACE', 'BIKES'],
    address: {
      lines: ['Carrer Elisabets 11'],
      cityName: 'Barcelona',
      countryCode: 'ES',
    },
    geoCode: { latitude: 41.3825, longitude: 2.1701 },
    description: 'Design hotel in the heart of El Raval',
    googleRating: 4.5,
    googleReviewCount: 750,
  },
  // Dubai Hotels
  {
    id: 'DXB-001',
    hotelId: 'HLDXB001',
    name: 'Burj Al Arab',
    cityCode: 'DXB',
    rating: 5,
    type: 'RESORT',
    pricePerNight: 1500,
    currency: 'EUR',
    amenities: [
      'WIFI',
      'POOL',
      'SPA',
      'RESTAURANT',
      'BUTLER_SERVICE',
      'HELIPAD',
    ],
    address: {
      lines: ['Jumeirah Beach Road'],
      cityName: 'Dubai',
      countryCode: 'AE',
    },
    geoCode: { latitude: 25.1412, longitude: 55.1852 },
    description: "The world's most luxurious hotel on its own island",
    googleRating: 4.8,
    googleReviewCount: 5600,
  },
  {
    id: 'DXB-002',
    hotelId: 'HLDXB002',
    name: 'Rove Downtown',
    cityCode: 'DXB',
    rating: 3,
    type: 'HOTEL',
    pricePerNight: 85,
    currency: 'EUR',
    amenities: ['WIFI', 'POOL', 'GYM', 'RESTAURANT'],
    address: {
      lines: ['Al Mustaqbal Street'],
      cityName: 'Dubai',
      countryCode: 'AE',
    },
    geoCode: { latitude: 25.1925, longitude: 55.2711 },
    description: 'Modern budget-friendly hotel near Burj Khalifa',
    googleRating: 4.3,
    googleReviewCount: 2100,
  },
  // London Hotels
  {
    id: 'LON-001',
    hotelId: 'HLLON001',
    name: 'The Savoy',
    cityCode: 'LON',
    rating: 5,
    type: 'HOTEL',
    pricePerNight: 550,
    currency: 'GBP',
    amenities: [
      'WIFI',
      'POOL',
      'SPA',
      'RESTAURANT',
      'BAR',
      'GYM',
      'BUTLER_SERVICE',
    ],
    address: {
      lines: ['Strand'],
      cityName: 'London',
      countryCode: 'GB',
    },
    geoCode: { latitude: 51.5103, longitude: -0.1205 },
    description: 'Legendary luxury on the Thames',
    googleRating: 4.7,
    googleReviewCount: 4200,
  },
  {
    id: 'LON-002',
    hotelId: 'HLLON002',
    name: 'Premier Inn London City',
    cityCode: 'LON',
    rating: 3,
    type: 'HOTEL',
    pricePerNight: 95,
    currency: 'GBP',
    amenities: ['WIFI', 'RESTAURANT', 'BAR'],
    address: {
      lines: ['One Aldgate'],
      cityName: 'London',
      countryCode: 'GB',
    },
    geoCode: { latitude: 51.5139, longitude: -0.0753 },
    description: 'Reliable comfort in the City of London',
    googleRating: 4.0,
    googleReviewCount: 3200,
  },
  // Paris Apartments
  {
    id: 'PAR-005',
    hotelId: 'HLPAR005',
    name: 'Le Marais Apartment',
    cityCode: 'PAR',
    rating: 4,
    type: 'APARTMENT',
    pricePerNight: 120,
    currency: 'EUR',
    amenities: ['WIFI', 'KITCHEN', 'WASHING_MACHINE', 'AIR_CONDITIONING'],
    address: {
      lines: ['22 Rue des Rosiers'],
      cityName: 'Paris',
      countryCode: 'FR',
    },
    geoCode: { latitude: 48.8575, longitude: 2.3614 },
    description: 'Stylish apartment in historic Le Marais',
    googleRating: 4.6,
    googleReviewCount: 450,
  },
  {
    id: 'PAR-006',
    hotelId: 'HLPAR006',
    name: 'Montmartre Studio',
    cityCode: 'PAR',
    rating: 3,
    type: 'APARTMENT',
    pricePerNight: 75,
    currency: 'EUR',
    amenities: ['WIFI', 'KITCHEN', 'AIR_CONDITIONING'],
    address: {
      lines: ['12 Rue Lepic'],
      cityName: 'Paris',
      countryCode: 'FR',
    },
    geoCode: { latitude: 48.8842, longitude: 2.3387 },
    description: 'Cozy studio with Sacré-Cœur views',
    googleRating: 4.3,
    googleReviewCount: 280,
  },
  // Rome Apartments
  {
    id: 'ROM-003',
    hotelId: 'HLROM003',
    name: 'Trastevere Apartment',
    cityCode: 'ROM',
    rating: 4,
    type: 'APARTMENT',
    pricePerNight: 110,
    currency: 'EUR',
    amenities: ['WIFI', 'KITCHEN', 'WASHING_MACHINE', 'TERRACE'],
    address: {
      lines: ['Via della Lungaretta 45'],
      cityName: 'Rome',
      countryCode: 'IT',
    },
    geoCode: { latitude: 41.8897, longitude: 12.4694 },
    description: 'Charming apartment in vibrant Trastevere',
    googleRating: 4.5,
    googleReviewCount: 320,
  },
  // Barcelona Apartments
  {
    id: 'BCN-003',
    hotelId: 'HLBCN003',
    name: 'Gothic Quarter Apartment',
    cityCode: 'BCN',
    rating: 4,
    type: 'APARTMENT',
    pricePerNight: 95,
    currency: 'EUR',
    amenities: ['WIFI', 'KITCHEN', 'AIR_CONDITIONING'],
    address: {
      lines: ['Carrer del Call 12'],
      cityName: 'Barcelona',
      countryCode: 'ES',
    },
    geoCode: { latitude: 41.3802, longitude: 2.1734 },
    description: 'Modern apartment in historic Gothic Quarter',
    googleRating: 4.4,
    googleReviewCount: 210,
  },
  // Dubai Apartments
  {
    id: 'DXB-003',
    hotelId: 'HLDXB003',
    name: 'Downtown Dubai Apartment',
    cityCode: 'DXB',
    rating: 4,
    type: 'APARTMENT',
    pricePerNight: 150,
    currency: 'EUR',
    amenities: ['WIFI', 'KITCHEN', 'POOL', 'GYM', 'AIR_CONDITIONING'],
    address: {
      lines: ['Business Bay'],
      cityName: 'Dubai',
      countryCode: 'AE',
    },
    geoCode: { latitude: 25.1972, longitude: 55.2744 },
    description: 'Luxury apartment with Burj Khalifa views',
    googleRating: 4.7,
    googleReviewCount: 890,
  },
  // London Apartments
  {
    id: 'LON-003',
    hotelId: 'HLLON003',
    name: 'Shoreditch Loft',
    cityCode: 'LON',
    rating: 4,
    type: 'APARTMENT',
    pricePerNight: 180,
    currency: 'GBP',
    amenities: ['WIFI', 'KITCHEN', 'WASHING_MACHINE'],
    address: {
      lines: ['Rivington Street'],
      cityName: 'London',
      countryCode: 'GB',
    },
    geoCode: { latitude: 51.5238, longitude: -0.0794 },
    description: 'Modern loft in trendy Shoreditch',
    googleRating: 4.6,
    googleReviewCount: 540,
  },
];
