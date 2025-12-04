import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CacheService } from '../common/cache/cache.service';

/**
 * Recommendations Service
 * Generates personalized travel recommendations based on user preferences and onboarding data
 */
@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Generate personalized recommendations for a user
   * @param userId - User ID
   * @param type - Type of recommendations ('all', 'destinations', 'offers', 'activities')
   * @param limit - Maximum number of recommendations per category
   * @returns Personalized recommendations object
   * @throws NotFoundException if user not found
   */
  async generatePersonalizedRecommendations(
    userId: string,
    type: string = 'all',
    limit: number = 10,
  ): Promise<any> {
    // Generate cache key
    const cacheKey = `recommendations:${userId}:${type}:${limit}`;

    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for recommendations: ${cacheKey}`);
      return cachedResult;
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const preferences = user.onboarding_preferences || {};
    const userPreferencesArray = user.preferences || [];

    // Generate recommendations based on preferences
    const destinations = this.matchDestinations(preferences, limit);
    const offers = this.matchOffers(preferences, limit);
    const activities = this.matchActivities(preferences, limit);

    const result: any = {
      generated_at: new Date().toISOString(),
      preferences_used: preferences,
    };

    if (type === 'all' || type === 'destinations') {
      result.destinations = destinations;
    }
    if (type === 'all' || type === 'offers') {
      result.offers = offers;
    }
    if (type === 'all' || type === 'activities') {
      result.activities = activities;
    }

    // Cache for 15 minutes (900 seconds)
    try {
      await this.cacheService.set(cacheKey, result, 900);
      this.logger.debug(`Cached recommendations: ${cacheKey}`);
    } catch (error) {
      // Cache failures shouldn't break the response
      this.logger.warn(`Failed to cache recommendations: ${error}`);
    }

    return result;
  }

  private matchDestinations(preferences: any, limit: number): any[] {
    // Mock destination data - replace with real data source
    const allDestinations = [
      {
        id: 'dest_1',
        name: 'Paris, France',
        image_url: '',
        match_score: 0,
        highlights: ['Eiffel Tower', 'Louvre Museum'],
        estimated_cost: { flight: 450, hotel_per_night: 120, currency: 'USD' },
      },
      {
        id: 'dest_2',
        name: 'Tokyo, Japan',
        image_url: '',
        match_score: 0,
        highlights: ['Shibuya', 'Temples'],
        estimated_cost: { flight: 800, hotel_per_night: 150, currency: 'USD' },
      },
      {
        id: 'dest_3',
        name: 'Bali, Indonesia',
        image_url: '',
        match_score: 0,
        highlights: ['Beaches', 'Temples'],
        estimated_cost: { flight: 600, hotel_per_night: 80, currency: 'USD' },
      },
      {
        id: 'dest_4',
        name: 'New York, USA',
        image_url: '',
        match_score: 0,
        highlights: ['Statue of Liberty', 'Broadway'],
        estimated_cost: { flight: 400, hotel_per_night: 200, currency: 'USD' },
      },
    ];

    return allDestinations
      .map((dest) => ({
        ...dest,
        match_score: this.calculateDestinationMatchScore(dest, preferences),
        reason: this.generateDestinationReason(dest, preferences),
      }))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  }

  private matchOffers(preferences: any, limit: number): any[] {
    // Mock offers - replace with real booking provider integration
    const allOffers = [
      {
        id: 'offer_1',
        type: 'flight',
        destination: 'Paris',
        price: 450,
        match_score: 0,
      },
      {
        id: 'offer_2',
        type: 'hotel',
        destination: 'Paris',
        price: 120,
        match_score: 0,
      },
      {
        id: 'offer_3',
        type: 'activity',
        destination: 'Paris',
        price: 25,
        match_score: 0,
      },
    ];

    return allOffers
      .map((offer) => ({
        ...offer,
        match_score: this.calculateOfferMatchScore(offer, preferences),
        reason: this.generateOfferReason(offer, preferences),
      }))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  }

  private matchActivities(preferences: any, limit: number): any[] {
    // Mock activities - replace with real data source
    const allActivities = [
      {
        id: 'activity_1',
        name: 'Seine River Cruise',
        type: 'sightseeing',
        destination: 'Paris',
        price: 25,
        match_score: 0,
      },
      {
        id: 'activity_2',
        name: 'Eiffel Tower Tour',
        type: 'sightseeing',
        destination: 'Paris',
        price: 30,
        match_score: 0,
      },
      {
        id: 'activity_3',
        name: 'Louvre Museum Visit',
        type: 'culture',
        destination: 'Paris',
        price: 20,
        match_score: 0,
      },
    ];

    return allActivities
      .map((activity) => ({
        ...activity,
        match_score: this.calculateActivityMatchScore(activity, preferences),
        reason: this.generateActivityReason(activity, preferences),
      }))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  }

  private calculateDestinationMatchScore(
    destination: any,
    preferences: any,
  ): number {
    let score = 0;
    let factors = 0;

    // Budget matching
    if (preferences.budget && destination.estimated_cost) {
      const totalCost =
        destination.estimated_cost.flight +
        destination.estimated_cost.hotel_per_night * 5;
      if (preferences.budget === 'low' && totalCost < 1000) score += 0.3;
      else if (
        preferences.budget === 'mid_range' &&
        totalCost >= 1000 &&
        totalCost < 3000
      )
        score += 0.3;
      else if (
        preferences.budget === 'high' &&
        totalCost >= 3000 &&
        totalCost < 10000
      )
        score += 0.3;
      else if (preferences.budget === 'luxury' && totalCost >= 10000)
        score += 0.3;
      factors += 0.3;
    }

    // Interest matching (if destination highlights match interests)
    if (preferences.interests && Array.isArray(preferences.interests)) {
      const matchingInterests = preferences.interests.filter(
        (interest: string) =>
          destination.highlights.some((highlight: string) =>
            highlight.toLowerCase().includes(interest.toLowerCase()),
          ),
      ).length;
      score += (matchingInterests / preferences.interests.length) * 0.4;
      factors += 0.4;
    }

    // Destination preference matching
    if (
      preferences.destination_preferences &&
      Array.isArray(preferences.destination_preferences)
    ) {
      // Simple matching logic - can be enhanced
      score += 0.3;
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0.5; // Default to 0.5 if no factors
  }

  private calculateOfferMatchScore(offer: any, preferences: any): number {
    let score = 0.5; // Base score

    // Budget matching
    if (preferences.budget) {
      if (preferences.budget === 'low' && offer.price < 100) score += 0.2;
      else if (
        preferences.budget === 'mid_range' &&
        offer.price >= 100 &&
        offer.price < 500
      )
        score += 0.2;
      else if (preferences.budget === 'high' && offer.price >= 500)
        score += 0.2;
    }

    // Type matching
    if (preferences.travel_type === 'business' && offer.type === 'flight')
      score += 0.3;
    else if (
      preferences.travel_type === 'leisure' &&
      (offer.type === 'hotel' || offer.type === 'activity')
    )
      score += 0.3;

    return Math.min(score, 1.0);
  }

  private calculateActivityMatchScore(activity: any, preferences: any): number {
    let score = 0.5;

    // Interest matching
    if (preferences.interests && Array.isArray(preferences.interests)) {
      if (preferences.interests.includes(activity.type)) score += 0.3;
      if (
        preferences.interests.includes('sightseeing') &&
        activity.type === 'sightseeing'
      )
        score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private generateDestinationReason(
    destination: any,
    preferences: any,
  ): string {
    const reasons: string[] = [];

    if (preferences.budget) {
      reasons.push(`matches your ${preferences.budget} budget`);
    }
    if (preferences.interests && preferences.interests.length > 0) {
      reasons.push(
        `aligns with your interests in ${preferences.interests.slice(0, 2).join(' and ')}`,
      );
    }
    if (preferences.travel_type) {
      reasons.push(`perfect for ${preferences.travel_type} travel`);
    }

    return reasons.length > 0
      ? `Matches your preferences: ${reasons.join(', ')}`
      : 'Recommended based on popular destinations';
  }

  private generateOfferReason(offer: any, preferences: any): string {
    if (preferences.budget) {
      return `Best price for your ${preferences.budget} budget`;
    }
    return 'Recommended offer';
  }

  private generateActivityReason(activity: any, preferences: any): string {
    if (
      preferences.interests &&
      preferences.interests.includes(activity.type)
    ) {
      return `Matches your interest in ${activity.type}`;
    }
    return 'Popular activity';
  }
}
