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
  private readonly googlePlacesKey = process.env.GOOGLE_PLACES_API_KEY;

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

      let hotels: Hotel[] = hotelListResponse.data?.data || [];
      
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

      const result: HotelSearchResponse = {
        data: hotels,
        meta: {
          count: hotels.length,
          source: 'amadeus',
        },
      };

      // Cache for 30 minutes
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
   * Enrich hotel data with Google Places reviews
   */
  async enrichWithGooglePlaces(hotel: Hotel): Promise<Hotel> {
    if (!this.googlePlacesKey) {
      return hotel;
    }

    try {
      // Find place by name and location
      const searchUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
      const searchResponse = await lastValueFrom(
        this.http.get(searchUrl, {
          params: {
            input: `${hotel.name} hotel ${hotel.address?.cityName || ''}`,
            inputtype: 'textquery',
            fields: 'place_id,rating,user_ratings_total',
            key: this.googlePlacesKey,
          },
        }),
      );

      const place = searchResponse.data?.candidates?.[0];
      if (place) {
        hotel.googlePlaceId = place.place_id;
        hotel.googleRating = place.rating;
        hotel.googleReviewCount = place.user_ratings_total;
      }

      return hotel;
    } catch (error) {
      this.logger.warn('Failed to enrich hotel with Google Places data', error);
      return hotel;
    }
  }

  /**
   * Get reviews from Google Places for a hotel
   */
  async getHotelReviews(placeId: string): Promise<any[]> {
    if (!this.googlePlacesKey || !placeId) {
      return [];
    }

    const cacheKey = `hotels:reviews:${placeId}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
      const response = await lastValueFrom(
        this.http.get(detailsUrl, {
          params: {
            place_id: placeId,
            fields: 'reviews,rating,user_ratings_total,photos',
            key: this.googlePlacesKey,
          },
        }),
      );

      const reviews = response.data?.result?.reviews || [];
      
      // Cache for 1 hour
      await this.cacheService.set(cacheKey, reviews, 3600);
      
      return reviews;
    } catch (error) {
      this.logger.warn('Failed to fetch Google Places reviews', error);
      return [];
    }
  }

  /**
   * Filter hotels by trip type
   */
  private filterByTripType(hotels: Hotel[], tripType: TripType): Hotel[] {
    const filters: Record<TripType, (h: Hotel) => boolean> = {
      business: (h) => (h.rating || 0) >= 4 || h.amenities?.some((a) => 
        ['BUSINESS_CENTER', 'WIFI', 'MEETING_ROOMS'].includes(a)),
      honeymoon: (h) => (h.rating || 0) >= 4 || h.amenities?.some((a) => 
        ['SPA', 'POOL', 'RESTAURANT'].includes(a)),
      family: (h) => h.amenities?.some((a) => 
        ['POOL', 'KIDS_CLUB', 'FAMILY_ROOMS'].includes(a)) ?? true,
      adventure: (h) => true, // All hotels
      leisure: (h) => true, // All hotels
      solo: (h) => (h.rating || 0) >= 3,
      wellness: (h) => h.amenities?.some((a) => 
        ['SPA', 'GYM', 'POOL', 'SAUNA'].includes(a)) ?? false,
      backpacking: (h) => (h.rating || 0) <= 3, // Budget options
    };

    const filterFn = filters[tripType] || (() => true);
    return hotels.filter(filterFn);
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

    if (params.tripType) {
      hotels = this.filterByTripType(hotels, params.tripType) as FallbackHotel[];
    }

    return {
      data: hotels.slice(0, params.limit || 20),
      meta: {
        count: hotels.length,
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
    googleRating: 4.2,
    googleReviewCount: 1800,
  },
];

