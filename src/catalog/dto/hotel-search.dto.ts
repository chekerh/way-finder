/**
 * Hotel Search DTOs for Amadeus Hotel API integration
 */

export interface HotelSearchDto {
  /** City code (e.g., 'PAR' for Paris) or city name (e.g., 'New York') */
  cityCode?: string;
  /** City name (e.g., 'New York', 'Paris') - used if cityCode is not provided */
  cityName?: string;
  /** Check-in date (YYYY-MM-DD) */
  checkInDate: string;
  /** Check-out date (YYYY-MM-DD) */
  checkOutDate: string;
  /** Number of adults */
  adults?: number;
  /** Number of rooms needed */
  roomQuantity?: number;
  /** Currency code (e.g., 'EUR', 'USD') */
  currency?: string;
  /** Minimum star rating (1-5) */
  ratings?: string; // comma-separated, e.g., "3,4,5"
  /** Maximum price per night */
  priceRange?: string; // e.g., "100-300"
  /** Hotel amenities filter */
  amenities?: string[]; // e.g., ['WIFI', 'POOL', 'SPA']
  /** Maximum results to return */
  limit?: number;
  /** Trip type for smart filtering */
  tripType?: TripType;
  /** Accommodation type filter (hotel, airbnb, hostel, resort, apartment) */
  accommodationType?: string;
}

export type TripType =
  | 'business'
  | 'leisure'
  | 'honeymoon'
  | 'family'
  | 'adventure'
  | 'solo'
  | 'wellness'
  | 'backpacking';

export interface HotelOfferDto {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  roomQuantity?: number;
  currency?: string;
}

export interface Hotel {
  id: string;
  name: string;
  chainCode?: string;
  brandCode?: string;
  dupeId?: string;
  hotelId: string;
  cityCode: string;
  address: HotelAddress;
  geoCode: GeoCode;
  rating?: number;
  amenities: string[];
  media?: HotelMedia[];
  description?: string;
  // Enhanced with Google Places data
  googleRating?: number;
  googleReviewCount?: number;
  googlePlaceId?: string;
}

export interface HotelAddress {
  lines?: string[];
  postalCode?: string;
  cityName?: string;
  countryCode?: string;
}

export interface GeoCode {
  latitude: number;
  longitude: number;
}

export interface HotelMedia {
  uri: string;
  category?: string;
}

export interface HotelOffer {
  id: string;
  hotelId: string;
  roomType: string;
  roomDescription?: string;
  bedType?: string;
  price: HotelPrice;
  policies?: HotelPolicies;
  guests?: GuestInfo;
}

export interface HotelPrice {
  currency: string;
  base: string;
  total: string;
  taxes?: Tax[];
  variations?: PriceVariation;
}

export interface Tax {
  amount: string;
  currency: string;
  code: string;
  pricingFrequency?: string;
  pricingMode?: string;
}

export interface PriceVariation {
  average?: { base: string };
  changes?: { startDate: string; endDate: string; base: string }[];
}

export interface HotelPolicies {
  cancellation?: {
    deadline?: string;
    amount?: string;
    description?: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
  guarantee?: {
    acceptedPayments: {
      creditCards?: string[];
      methods?: string[];
    };
  };
}

export interface GuestInfo {
  adults: number;
}

export interface HotelSearchResponse {
  data: Hotel[];
  meta: {
    count: number;
    source: 'amadeus' | 'fallback';
  };
}

export interface HotelOffersResponse {
  data: {
    hotel: Hotel;
    offers: HotelOffer[];
  }[];
  meta: {
    count: number;
  };
}

// Fallback hotel data for when API is unavailable
export interface FallbackHotel extends Hotel {
  pricePerNight: number;
  currency: string;
  type: 'HOTEL' | 'HOSTEL' | 'RESORT' | 'APARTMENT' | 'CAMPING';
}

