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

    const search: FlightSearchDto = {
      originLocationCode:
        overrides.originLocationCode ?? preferences.home_airport ?? preferences.origin ?? 'TUN',
      destinationLocationCode:
        overrides.destinationLocationCode ??
        preferences.destination_preferences?.[0] ??
        'CDG',
      departureDate: overrides.departureDate ?? this.generateDateString(14),
      returnDate: overrides.returnDate ?? this.generateDateString(21),
      travelClass: overrides.travelClass ?? this.mapTravelClass(preferences.travel_type),
      adults: overrides.adults ?? 1,
      currencyCode: overrides.currencyCode ?? preferences.currency ?? 'EUR',
      max: overrides.maxResults ?? 5,
      maxPrice: overrides.maxPrice ?? preferences.budget_cap,
    };

    return this.amadeus.searchFlights(search);
  }

  async getExploreOffers(params: ExploreSearchDto) {
    return this.tequila.searchExplore(params);
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

