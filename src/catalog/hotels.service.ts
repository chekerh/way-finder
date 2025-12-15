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
        this.http.post(`${this.host}/v1/security/oauth2/token`, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      this.cachedToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.cachedToken as string;
    } catch (error) {
      this.logger.error('Failed to fetch Amadeus token', error);
      throw new InternalServerErrorException('Failed to authenticate with Amadeus');
    }
  }

  /**
   * Search for hotels by city
   * Uses Amadeus Hotel List API to find hotels in a city
   */
  async searchHotels(params: HotelSearchDto): Promise<HotelSearchResponse> {
    const cacheKey = `hotels:search:${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = await this.cacheService.get<HotelSearchResponse>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for hotel search: ${params.cityCode}`);
      return cached;
    }

    if (!this.isConfigured()) {
      this.logger.warn('Amadeus not configured, using fallback hotels');
      return this.getFallbackHotels(params);
    }

    try {
      const accessToken = await this.getAccessToken();
      
      // Step 1: Get hotel IDs by city
      const hotelListUrl = `${this.host}/v1/reference-data/locations/hotels/by-city`;
      const hotelListResponse = await lastValueFrom(
        this.http.get(hotelListUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            cityCode: params.cityCode.toUpperCase(),
            radius: 50,
            radiusUnit: 'KM',
            hotelSource: 'ALL',
          },
        }),
      );

      const rawHotels = hotelListResponse.data?.data || [];
      
      // Map Amadeus hotels to ensure they have 'id' field (required by Android)
      // Amadeus provides real hotel names and data, so we preserve them
      let hotels: Hotel[] = rawHotels.map((hotel: any) => ({
        ...hotel,
        id: hotel.id || hotel.hotelId || `hotel-${hotel.hotelId || Date.now()}-${Math.random()}`,
        hotelId: hotel.hotelId || hotel.id || '',
        // Preserve real hotel name from Amadeus (don't override)
        name: hotel.name || hotel.hotelName || `Hotel ${hotel.hotelId}`,
        // Set default type if missing (Amadeus doesn't provide type, default to HOTEL)
        type: hotel.type || 'HOTEL',
        // Set default pricePerNight if missing (for fallback compatibility)
        pricePerNight: hotel.pricePerNight || (hotel.price?.base ? parseFloat(hotel.price.base) : undefined),
        currency: hotel.currency || hotel.price?.currency || 'EUR',
        // Preserve any media/images from Amadeus if available
        media: hotel.media || hotel.images || undefined,
      }));
      
      // Apply accommodation type filtering (hotel, airbnb, hostel, resort, apartment)
      if (params.accommodationType) {
        hotels = this.filterByAccommodationType(hotels, params.accommodationType);
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
        id: h.id || h.hotelId || `hotel-${h.hotelId || Date.now()}-${Math.random()}`,
        hotelId: h.hotelId || h.id || '',
      }));

      // Enrich hotels with images from free APIs (Pixabay/Unsplash)
      this.logger.debug(`Enriching ${mappedHotels.length} hotels with images`);
      mappedHotels = await Promise.all(
        mappedHotels.map((hotel) => this.enrichWithImages(hotel, params.cityCode))
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
   */
  async enrichWithImages(hotel: Hotel, cityCode: string): Promise<Hotel> {
    // If hotel already has media, keep it
    if (hotel.media && hotel.media.length > 0) {
      return hotel;
    }

    try {
      const cityName = hotel.address?.cityName || cityCode;
      const searchQuery = `${hotel.name} ${cityName} hotel`.trim();
      
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
            this.logger.debug(`Found ${media.length} images from Pixabay for ${hotel.name}`);
            return hotel;
          }
        } catch (error) {
          this.logger.debug('Pixabay API failed, trying Unsplash', error);
        }
      }

      // Fallback to Unsplash Source API (no API key needed)
      // Use direct image URLs based on search terms
      const imageKeywords = `${cityName} hotel luxury`.replace(/\s+/g, ',');
      hotel.media = [
        {
          uri: `https://source.unsplash.com/800x600/?${imageKeywords}`,
          category: 'EXTERIOR',
        },
        {
          uri: `https://source.unsplash.com/800x600/?hotel,room,${cityName.replace(/\s+/g, ',')}`,
          category: 'INTERIOR',
        },
      ];

      return hotel;
    } catch (error) {
      this.logger.warn('Failed to enrich hotel with images', error);
      // Return hotel with default image
      if (!hotel.media || hotel.media.length === 0) {
        const cityName = hotel.address?.cityName || 'hotel';
        hotel.media = [{
          uri: `https://source.unsplash.com/800x600/?hotel,${cityName.replace(/\s+/g, ',')}`,
          category: 'EXTERIOR',
        }];
      }
      return hotel;
    }
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
   */
  private filterByAccommodationType(hotels: Hotel[], accommodationType: string): Hotel[] {
    const typeMap: Record<string, string[]> = {
      hotel: ['HOTEL'],
      airbnb: ['APARTMENT', 'HOTEL'], // Airbnb-like properties are often apartments or small hotels
      hostel: ['HOSTEL'],
      resort: ['RESORT'],
      apartment: ['APARTMENT'],
    };

    const allowedTypes = typeMap[accommodationType.toLowerCase()] || ['HOTEL'];
    
    return hotels.filter((h) => {
      // Check if hotel has type property (from fallback data)
      const hotelType = (h as any).type;
      if (hotelType) {
        return allowedTypes.includes(hotelType);
      }
      // If no type property, default behavior:
      // - For airbnb/apartment: include hotels with apartment-like amenities
      // - For hostel: include budget hotels (rating <= 3)
      // - For resort: include hotels with resort amenities (POOL, SPA, etc.)
      // - For hotel: include all
      if (accommodationType.toLowerCase() === 'airbnb' || accommodationType.toLowerCase() === 'apartment') {
        return allowedTypes.includes('APARTMENT') || allowedTypes.includes('HOTEL');
      }
      if (accommodationType.toLowerCase() === 'hostel') {
        return (h.rating || 0) <= 3 || h.amenities?.some((a) => 
          ['SHARED_KITCHEN', 'DORMITORY'].includes(a));
      }
      if (accommodationType.toLowerCase() === 'resort') {
        return h.amenities?.some((a) => 
          ['POOL', 'SPA', 'BEACH_ACCESS', 'GOLF'].includes(a)) || (h.rating || 0) >= 4;
      }
      // Default: include all for 'hotel'
      return true;
    });
  }

  /**
   * Filter hotels by trip type
   * Made less strict to avoid filtering out all hotels
   */
  private filterByTripType(hotels: Hotel[], tripType: TripType): Hotel[] {
    const filters: Record<TripType, (h: Hotel) => boolean> = {
      business: (h) => {
        // Less strict: rating >= 3 OR has business amenities OR has wifi
        return (h.rating || 0) >= 3 || 
               h.amenities?.some((a) => ['BUSINESS_CENTER', 'WIFI', 'MEETING_ROOMS'].includes(a)) ||
               h.amenities?.some((a) => a.includes('WIFI')) ||
               !h.rating; // Include hotels without rating
      },
      honeymoon: (h) => {
        // Less strict: rating >= 3 OR has romantic amenities OR no rating
        return (h.rating || 0) >= 3 || 
               h.amenities?.some((a) => ['SPA', 'POOL', 'RESTAURANT'].includes(a)) ||
               !h.rating;
      },
      family: (h) => {
        // Include all hotels
        return true;
      },
      adventure: (h) => true, // All hotels
      leisure: (h) => true, // All hotels
      solo: (h) => {
        // Less strict: rating >= 2.5 or no rating
        return (h.rating || 0) >= 2.5 || !h.rating;
      },
      wellness: (h) => {
        // Less strict: has wellness amenities OR rating >= 3 OR no rating
        return h.amenities?.some((a) => 
          ['SPA', 'GYM', 'POOL', 'SAUNA'].includes(a)) || 
          (h.rating || 0) >= 3 ||
          !h.rating;
      },
      backpacking: (h) => {
        // Less strict: rating <= 4 OR no rating (more budget options)
        return (h.rating || 0) <= 4 || !h.rating;
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
    let hotels = FALLBACK_HOTELS.filter(
      (h) => h.cityCode.toUpperCase() === params.cityCode.toUpperCase(),
    );

    if (!hotels.length) {
      // Return generic hotels if city not found
      hotels = FALLBACK_HOTELS.slice(0, params.limit || 10);
    }

    if (params.accommodationType) {
      hotels = this.filterByAccommodationType(hotels, params.accommodationType) as FallbackHotel[];
    }

    if (params.tripType) {
      hotels = this.filterByTripType(hotels, params.tripType) as FallbackHotel[];
    }

    // Explicitly map to ensure all required fields are present (especially 'id')
    const mappedHotels: Hotel[] = hotels.slice(0, params.limit || 20).map((h) => ({
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
    
    const offers = hotelIds.map((hotelId) => {
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
    }).filter(Boolean);

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
    amenities: ['WIFI', 'RESTAURANT', 'BAR', 'ROOM_SERVICE', 'AIR_CONDITIONING'],
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
    amenities: ['WIFI', 'POOL', 'SPA', 'RESTAURANT', 'BAR', 'GYM', 'ROOM_SERVICE'],
    address: {
      lines: ['10 Avenue d\'Iéna'],
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
    amenities: ['WIFI', 'POOL', 'SPA', 'RESTAURANT', 'BUTLER_SERVICE', 'HELIPAD'],
    address: {
      lines: ['Jumeirah Beach Road'],
      cityName: 'Dubai',
      countryCode: 'AE',
    },
    geoCode: { latitude: 25.1412, longitude: 55.1852 },
    description: 'The world\'s most luxurious hotel on its own island',
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
    amenities: ['WIFI', 'POOL', 'SPA', 'RESTAURANT', 'BAR', 'GYM', 'BUTLER_SERVICE'],
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

