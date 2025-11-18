import { Injectable, NotFoundException } from '@nestjs/common';
import { AmadeusService, AmadeusRateLimitError } from './amadeus.service';
import { ActivitiesService } from './activities.service';
import type { ActivityFeedResponse } from './activities.service';
import { FlightSearchDto, RecommendedQueryDto } from './dto/flight-search.dto';
import { ExploreSearchDto } from './dto/explore-search.dto';
import { ActivitySearchDto } from './dto/activity-search.dto';
import { UserService } from '../user/user.service';
import { FALLBACK_EXPLORE_OFFERS, FALLBACK_FLIGHT_OFFERS } from './catalog.fallback';

@Injectable()
export class CatalogService {
  private amadeusCooldownUntil = 0;

  constructor(
    private readonly amadeus: AmadeusService,
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
        if (error instanceof AmadeusRateLimitError) {
          this.registerAmadeusRateLimit();
        } else {
          this.registerAmadeusFailure();
        }
        return this.buildFallbackFlightResponse([overrides.destinationLocationCode!], overrides.maxResults ?? 5);
      }
    }

    // Otherwise, search for multiple popular destinations to provide variety
    const popularDestinations =
      preferences.destination_preferences?.length > 0
        ? preferences.destination_preferences
        : ['CDG', 'FCO', 'BCN', 'DXB', 'JFK'];

    const allFlights: any[] = [];
    const totalRequested = overrides.maxResults ?? 15;
    const numDestinations = Math.min(3, popularDestinations.length);
    const maxPerDestination = Math.max(2, Math.floor(totalRequested / numDestinations));

    if (this.shouldUseFallbackFlights()) {
      return this.buildFallbackFlightResponse(popularDestinations, totalRequested);
    }

    let hadSuccessfulExternalCall = false;

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
        if (result?.data?.length) {
          hadSuccessfulExternalCall = true;
          return result.data;
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
      return this.buildFallbackFlightResponse(popularDestinations, totalRequested);
    }

    if (hadSuccessfulExternalCall) {
      this.registerAmadeusSuccess();
    }

    return { data: allFlights.slice(0, totalRequested), meta: {} };
  }

  async getExploreOffers(params: ExploreSearchDto) {
    const origin = (params.origin ?? 'TUN').toUpperCase();
    const max = params.limit ?? 10;
    const budget = params.budget;
    const destination = params.destination?.toUpperCase();

    let offers = FALLBACK_EXPLORE_OFFERS.filter((offer) => offer.flyFrom === origin);

    if (destination) {
      offers = offers.filter((offer) => offer.flyTo === destination);
    }

    if (typeof budget === 'number') {
      offers = offers.filter((offer) => offer.price <= budget);
    }

    if (!offers.length) {
      offers = FALLBACK_EXPLORE_OFFERS;
    }

    return {
      data: offers.slice(0, max),
      currency: 'EUR',
      source: 'fallback',
    };
  }

  async getActivitiesFeed(params: ActivitySearchDto): Promise<ActivityFeedResponse> {
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
    return !this.amadeus.isConfigured() || Date.now() < this.amadeusCooldownUntil;
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

  private buildFallbackFlightResponse(preferredDestinations: string[], maxResults?: number) {
    const normalizedPrefs = preferredDestinations.map((code) => code.toUpperCase());

    let flights = FALLBACK_FLIGHT_OFFERS.filter((flight) =>
      normalizedPrefs.includes(flight.destinationCode),
    );

    if (!flights.length) {
      flights = FALLBACK_FLIGHT_OFFERS;
    }

    const slice = flights.slice(0, maxResults ?? flights.length);

    return {
      data: slice.map((flight) => flight.offer),
      meta: { fallback: true },
    };
  }
}

