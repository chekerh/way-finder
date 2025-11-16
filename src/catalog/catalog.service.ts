import { Injectable, NotFoundException } from '@nestjs/common';
import { AmadeusService } from './amadeus.service';
import { TequilaService } from './tequila.service';
import { ActivitiesService } from './activities.service';
import { FlightSearchDto, RecommendedQueryDto } from './dto/flight-search.dto';
import { ExploreSearchDto } from './dto/explore-search.dto';
import { ActivitySearchDto } from './dto/activity-search.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly amadeus: AmadeusService,
    private readonly tequila: TequilaService,
    private readonly activities: ActivitiesService,
    private readonly userService: UserService,
  ) {}

  async getRecommendedFlights(userId: string, overrides: RecommendedQueryDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const preferences = (user as any)?.onboarding_preferences ?? {};
    const origin = overrides.originLocationCode ?? preferences.home_airport ?? preferences.origin ?? 'TUN';

    // If a specific destination is requested, use it
    if (overrides.destinationLocationCode) {
      const search: FlightSearchDto = {
        originLocationCode: origin,
        destinationLocationCode: overrides.destinationLocationCode,
        departureDate: overrides.departureDate ?? this.generateDateString(14),
        returnDate: overrides.returnDate ?? this.generateDateString(21),
        travelClass: overrides.travelClass ?? this.mapTravelClass(preferences.travel_type),
        adults: overrides.adults ?? 1,
        currencyCode: overrides.currencyCode ?? preferences.currency ?? 'EUR',
        max: overrides.maxResults ?? 5,
        maxPrice: overrides.maxPrice ?? preferences.budget_cap,
      };

      try {
        return this.amadeus.searchFlights(search);
      } catch (error) {
        return { data: [], meta: {} };
      }
    }

    // Otherwise, search for multiple popular destinations to provide variety
    const popularDestinations = preferences.destination_preferences?.length > 0
      ? preferences.destination_preferences
      : ['CDG', 'LHR', 'FCO', 'MAD', 'AMS', 'FRA', 'DXB', 'JFK']; // Popular destinations

    const allFlights: any[] = [];
    const totalRequested = overrides.maxResults ?? 15;
    const numDestinations = Math.min(5, popularDestinations.length); // Search up to 5 destinations
    const maxPerDestination = Math.max(2, Math.floor(totalRequested / numDestinations)); // At least 2 per destination

    // Search for flights to multiple destinations in parallel (using Promise.all for better performance)
    const searchPromises = popularDestinations.slice(0, numDestinations).map(async (dest) => {
      try {
        const search: FlightSearchDto = {
          originLocationCode: origin,
          destinationLocationCode: dest,
          departureDate: overrides.departureDate ?? this.generateDateString(14),
          returnDate: overrides.returnDate ?? this.generateDateString(21),
          travelClass: overrides.travelClass ?? this.mapTravelClass(preferences.travel_type),
          adults: overrides.adults ?? 1,
          currencyCode: overrides.currencyCode ?? preferences.currency ?? 'EUR',
          max: maxPerDestination,
          maxPrice: overrides.maxPrice ?? preferences.budget_cap,
        };

        const result = await this.amadeus.searchFlights(search);
        return result?.data ?? [];
      } catch (error) {
        // Return empty array if search fails
        return [];
      }
    });

    // Wait for all searches to complete
    const results = await Promise.all(searchPromises);
    results.forEach(flights => {
      if (flights.length > 0) {
        allFlights.push(...flights);
      }
    });

    return { data: allFlights, meta: {} };
  }

  async getExploreOffers(params: ExploreSearchDto) {
    try {
      return this.tequila.searchExplore(params);
    } catch (error) {
      // If Tequila is not configured, return empty result
      return { data: [], currency: 'EUR' };
    }
  }

  async getActivitiesFeed(params: ActivitySearchDto) {
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
}

