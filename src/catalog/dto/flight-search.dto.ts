export type TravelClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface FlightSearchDto {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  travelClass?: TravelClass;
  currencyCode?: string;
  max?: number;
  maxPrice?: number;
}

export interface RecommendedQueryDto extends Partial<FlightSearchDto> {
  adults?: number;
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
  airline?: string;
  maxDuration?: number; // in minutes
}
