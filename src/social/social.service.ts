import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserFollow, UserFollowDocument } from './social.schema';
import { SharedTrip, SharedTripDocument } from './social.schema';
import { Journey, JourneyDocument } from '../journey/journey.schema';
import { FollowUserDto, ShareTripDto, UpdateSharedTripDto } from './social.dto';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    @InjectModel(UserFollow.name)
    private readonly userFollowModel: Model<UserFollowDocument>,
    @InjectModel(SharedTrip.name)
    private readonly sharedTripModel: Model<SharedTripDocument>,
    @InjectModel(Journey.name)
    private readonly journeyModel: Model<JourneyDocument>,
  ) {}

  // ========== FOLLOW/UNFOLLOW ==========

  async followUser(
    followerId: string,
    followingId: string,
  ): Promise<{ message: string; following: boolean }> {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existingFollow = await this.userFollowModel
      .findOne({
        followerId,
        followingId,
      })
      .exec();

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    await this.userFollowModel.create({
      followerId,
      followingId,
      followedAt: new Date(),
    });

    return { message: 'User followed successfully', following: true };
  }

  async unfollowUser(
    followerId: string,
    followingId: string,
  ): Promise<{ message: string; following: boolean }> {
    const result = await this.userFollowModel
      .deleteOne({
        followerId,
        followingId,
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Follow relationship not found');
    }

    return { message: 'User unfollowed successfully', following: false };
  }

  async checkFollowStatus(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const follow = await this.userFollowModel
      .findOne({
        followerId,
        followingId,
      })
      .exec();

    return !!follow;
  }

  /**
   * Get followers (non-paginated - for backward compatibility)
   * @deprecated Use getFollowersPaginated instead for better performance
   */
  async getFollowers(
    userId: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<any[]> {
    const follows = await this.userFollowModel
      .find({ followingId: userId })
      .populate('followerId', 'username first_name last_name profile_image_url')
      .sort({ followedAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    return follows.map((follow) => {
      const follower = (follow.followerId as any).toObject
        ? (follow.followerId as any).toObject()
        : follow.followerId;
      return {
        ...follower,
        followedAt: follow.followedAt,
      };
    });
  }

  /**
   * Get paginated followers
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Paginated followers results
   */
  async getFollowersPaginated(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query = { followingId: userId };

    const [data, total] = await Promise.all([
      this.userFollowModel
        .find(query)
        .populate(
          'followerId',
          'username first_name last_name profile_image_url',
        )
        .sort({ followedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userFollowModel.countDocuments(query).exec(),
    ]);

    const transformedData = data.map((follow) => {
      const follower = (follow.followerId as any).toObject
        ? (follow.followerId as any).toObject()
        : follow.followerId;
      return {
        ...follower,
        followedAt: follow.followedAt,
      };
    });

    return { data: transformedData, total };
  }

  /**
   * Get following (non-paginated - for backward compatibility)
   * @deprecated Use getFollowingPaginated instead for better performance
   */
  async getFollowing(
    userId: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<any[]> {
    const follows = await this.userFollowModel
      .find({ followerId: userId })
      .populate(
        'followingId',
        'username first_name last_name profile_image_url',
      )
      .sort({ followedAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    return follows.map((follow) => {
      const following = (follow.followingId as any).toObject
        ? (follow.followingId as any).toObject()
        : follow.followingId;
      return {
        ...following,
        followedAt: follow.followedAt,
      };
    });
  }

  /**
   * Get paginated following
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Paginated following results
   */
  async getFollowingPaginated(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query = { followerId: userId };

    const [data, total] = await Promise.all([
      this.userFollowModel
        .find(query)
        .populate(
          'followingId',
          'username first_name last_name profile_image_url',
        )
        .sort({ followedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userFollowModel.countDocuments(query).exec(),
    ]);

    const transformedData = data.map((follow) => {
      const following = (follow.followingId as any).toObject
        ? (follow.followingId as any).toObject()
        : follow.followingId;
      return {
        ...following,
        followedAt: follow.followedAt,
      };
    });

    return { data: transformedData, total };
  }

  async getFollowCounts(
    userId: string,
  ): Promise<{ followers: number; following: number }> {
    const [followersCount, followingCount] = await Promise.all([
      this.userFollowModel.countDocuments({ followingId: userId }).exec(),
      this.userFollowModel.countDocuments({ followerId: userId }).exec(),
    ]);

    return {
      followers: followersCount,
      following: followingCount,
    };
  }

  // ========== SHARED TRIPS ==========

  async shareTrip(
    userId: string,
    shareTripDto: ShareTripDto,
  ): Promise<SharedTrip> {
    const sharedTrip = new this.sharedTripModel({
      userId,
      ...shareTripDto,
      isPublic: shareTripDto.isPublic ?? true,
      isVisible: true,
    });

    const savedTrip = await sharedTrip.save();
    return this.sharedTripModel
      .findById(savedTrip._id)
      .populate('userId', 'username first_name last_name profile_image_url')
      .exec() as any;
  }

  async updateSharedTrip(
    userId: string,
    tripId: string,
    updateDto: UpdateSharedTripDto,
  ): Promise<SharedTrip> {
    const trip = await this.sharedTripModel
      .findOne({ _id: tripId, userId, isVisible: true })
      .exec();

    if (!trip) {
      throw new NotFoundException(
        'Shared trip not found or you do not have permission to update it',
      );
    }

    Object.assign(trip, updateDto);
    const savedTrip = await trip.save();
    return this.sharedTripModel
      .findById(savedTrip._id)
      .populate('userId', 'username first_name last_name profile_image_url')
      .exec() as any;
  }

  async deleteSharedTrip(userId: string, tripId: string): Promise<void> {
    const result = await this.sharedTripModel
      .updateOne({ _id: tripId, userId }, { isVisible: false })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException(
        'Shared trip not found or you do not have permission to delete it',
      );
    }
  }

  async getSharedTrip(tripId: string, viewerId?: string): Promise<SharedTrip> {
    const trip = await this.sharedTripModel
      .findOne({ _id: tripId, isVisible: true })
      .populate('userId', 'username first_name last_name profile_image_url')
      .exec();

    if (!trip) {
      throw new NotFoundException('Shared trip not found');
    }

    // Check if viewer has access (public or following)
    if (!trip.isPublic && viewerId) {
      const isFollowing = await this.checkFollowStatus(
        viewerId,
        trip.userId.toString(),
      );
      if (!isFollowing && viewerId !== trip.userId.toString()) {
        throw new ForbiddenException('You do not have access to this trip');
      }
    } else if (!trip.isPublic && !viewerId) {
      throw new ForbiddenException('This trip is private');
    }

    return trip as any;
  }

  /**
   * Get user shared trips (non-paginated - for backward compatibility)
   * @deprecated Use getUserSharedTripsPaginated instead for better performance
   */
  async getUserSharedTrips(
    userId: string,
    limit: number = 20,
    skip: number = 0,
  ): Promise<SharedTrip[]> {
    return this.sharedTripModel
      .find({ userId, isVisible: true })
      .populate('userId', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec() as any;
  }

  /**
   * Get paginated user shared trips
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Paginated shared trips results
   */
  async getUserSharedTripsPaginated(
    userId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const query = { userId, isVisible: true };

    const [data, total] = await Promise.all([
      this.sharedTripModel
        .find(query)
        .populate('userId', 'username first_name last_name profile_image_url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.sharedTripModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  /**
   * Get social feed (non-paginated - for backward compatibility)
   * @deprecated Use getSocialFeedPaginated instead for better performance
   */
  async getSocialFeed(
    userId: string,
    limit: number = 20,
    skip: number = 0,
  ): Promise<SharedTrip[]> {
    // Get list of users that the current user is following
    const following = await this.userFollowModel
      .find({ followerId: userId })
      .select('followingId')
      .exec();

    const followingIds = following.map((f) => f.followingId);

    // Get public trips from followed users, plus user's own trips
    const query = {
      isVisible: true,
      $or: [
        { userId: { $in: [...followingIds, userId] } }, // Trips from followed users or self
        { isPublic: true }, // Or any public trips
      ],
    };

    return this.sharedTripModel
      .find(query)
      .populate('userId', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec() as any;
  }

  /**
   * Get paginated social feed
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Paginated social feed results
   */
  async getSocialFeedPaginated(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // Get list of users that the current user is following
    const following = await this.userFollowModel
      .find({ followerId: userId })
      .select('followingId')
      .exec();

    const followingIds = following.map((f) => f.followingId);

    // Get public trips from followed users, plus user's own trips
    const query = {
      isVisible: true,
      $or: [
        { userId: { $in: [...followingIds, userId] } }, // Trips from followed users or self
        { isPublic: true }, // Or any public trips
      ],
    };

    const [data, total] = await Promise.all([
      this.sharedTripModel
        .find(query)
        .populate('userId', 'username first_name last_name profile_image_url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.sharedTripModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async likeSharedTrip(
    userId: string,
    tripId: string,
  ): Promise<{ message: string; likesCount: number }> {
    // In a full implementation, you'd have a separate likes collection
    // For now, we'll just increment the likes count
    const trip = await this.sharedTripModel.findById(tripId).exec();
    if (!trip || !trip.isVisible) {
      throw new NotFoundException('Shared trip not found');
    }

    trip.likesCount = (trip.likesCount || 0) + 1;
    await trip.save();

    return { message: 'Trip liked successfully', likesCount: trip.likesCount };
  }

  async getMapMemories(userId: string): Promise<any> {
    const publicBaseUrl = (
      process.env.PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      'http://localhost:3000'
    ).replace(/\/$/, '');

    this.logger.debug(`Getting map memories for user ${userId}`);

    // Get all shared trips for the user
    const sharedTripsRaw = await this.sharedTripModel
      .find({ userId, isVisible: true })
      .populate('userId', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .exec();

    this.logger.debug(`Found ${sharedTripsRaw.length} shared trips for user ${userId}`);

    // Format shared trips with full image URLs
    const sharedTrips = sharedTripsRaw.map((trip: any) => {
      const tripObj = trip.toObject ? trip.toObject() : trip;
      return {
        ...tripObj,
        images: (tripObj.images || []).map((url: string) => {
          return url.startsWith('http')
            ? url
            : `${publicBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }),
      };
    });

    // Get all journeys for the user (these are the shared journeys)
    const journeys = await this.journeyModel
      .find({ user_id: userId, is_visible: true })
      .populate('user_id', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .exec();

    this.logger.debug(`Found ${journeys.length} journeys for user ${userId}`);

    // Convert journeys to shared trip format for processing
    const journeyAsTrips = journeys.map((journey: any) => {
      const journeyObj = journey.toObject ? journey.toObject() : journey;
      // Get images from slides or image_urls and ensure full URLs
      let images: string[] = [];
      if (journeyObj.slides && journeyObj.slides.length > 0) {
        images = journeyObj.slides.map((slide: any) => {
          const imageUrl = slide.imageUrl || slide.image_url || '';
          return imageUrl.startsWith('http')
            ? imageUrl
            : `${publicBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        });
      } else if (journeyObj.image_urls && journeyObj.image_urls.length > 0) {
        images = journeyObj.image_urls.map((url: string) => {
          return url.startsWith('http')
            ? url
            : `${publicBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        });
      }

      // Get user info from populated user_id
      const userIdObj =
        journeyObj.user_id && typeof journeyObj.user_id === 'object'
          ? journeyObj.user_id
          : {
              _id: journeyObj.user_id,
              username: '',
              first_name: '',
              last_name: '',
              profile_image_url: '',
            };

      return {
        _id: journeyObj._id,
        userId: userIdObj,
        title:
          journeyObj.destination || journeyObj.caption_text || 'My Journey',
        description: journeyObj.description || journeyObj.caption_text || null,
        tripType: 'custom',
        tripId: journeyObj.booking_id ? journeyObj.booking_id.toString() : null,
        images: images,
        tags: journeyObj.tags || [],
        destination: journeyObj.destination, // Add destination field directly for easier detection
        metadata: {
          ...journeyObj.metadata,
          destination: journeyObj.destination,
          country: journeyObj.metadata?.country || null,
        },
        likesCount: journeyObj.likes_count || 0,
        commentsCount: journeyObj.comments_count || 0,
        sharesCount: 0,
        isPublic: journeyObj.is_public !== false,
        isVisible: journeyObj.is_visible !== false,
        createdAt: journeyObj.createdAt
          ? new Date(journeyObj.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: journeyObj.updatedAt
          ? new Date(journeyObj.updatedAt).toISOString()
          : new Date().toISOString(),
      };
    });

    // Combine shared trips and journeys
    const trips = [...sharedTrips, ...journeyAsTrips];

    this.logger.debug(
      `Total trips found: ${trips.length} (${sharedTrips.length} shared trips + ${journeyAsTrips.length} journeys)`,
    );

    // City to Country mapping (popular cities)
    const cityToCountry: Record<string, string> = {
      // France
      paris: 'France',
      'paris, france': 'France',
      'paris france': 'France',
      lyon: 'France',
      marseille: 'France',
      nice: 'France',
      toulouse: 'France',
      bordeaux: 'France',
      strasbourg: 'France',
      nantes: 'France',
      // Italy
      rome: 'Italy',
      milan: 'Italy',
      venice: 'Italy',
      florence: 'Italy',
      naples: 'Italy',
      turin: 'Italy',
      palermo: 'Italy',
      // Spain
      madrid: 'Spain',
      barcelona: 'Spain',
      seville: 'Spain',
      valencia: 'Spain',
      bilbao: 'Spain',
      granada: 'Spain',
      // Brazil
      'rio de janeiro': 'Brazil',
      rio: 'Brazil',
      'sao paulo': 'Brazil',
      brasilia: 'Brazil',
      salvador: 'Brazil',
      // United States
      'new york': 'United States',
      'los angeles': 'United States',
      chicago: 'United States',
      miami: 'United States',
      'san francisco': 'United States',
      boston: 'United States',
      washington: 'United States',
      'las vegas': 'United States',
      // UAE
      dubai: 'United Arab Emirates',
      'dubai, uae': 'United Arab Emirates',
      'dubai uae': 'United Arab Emirates',
      'dubai, united arab emirates': 'United Arab Emirates',
      uae: 'United Arab Emirates',
      'abu dhabi': 'United Arab Emirates',
      // United Kingdom
      london: 'United Kingdom',
      'london, united kingdom': 'United Kingdom',
      'london united kingdom': 'United Kingdom',
      manchester: 'United Kingdom',
      edinburgh: 'United Kingdom',
      birmingham: 'United Kingdom',
      liverpool: 'United Kingdom',
      // Germany
      berlin: 'Germany',
      munich: 'Germany',
      hamburg: 'Germany',
      frankfurt: 'Germany',
      cologne: 'Germany',
      // Other
      istanbul: 'Turkey',
      ankara: 'Turkey',
      tokyo: 'Japan',
      'tokyo, japan': 'Japan',
      'tokyo japan': 'Japan',
      osaka: 'Japan',
      kyoto: 'Japan',
      seoul: 'South Korea',
      'seoul, south korea': 'South Korea',
      'seoul south korea': 'South Korea',
      bangkok: 'Thailand',
      'bangkok, thailand': 'Thailand',
      'bangkok thailand': 'Thailand',
      singapore: 'Singapore',
      'singapore, singapore': 'Singapore',
      'singapore singapore': 'Singapore',
      sydney: 'Australia',
      melbourne: 'Australia',
      // Tunisia
      tunis: 'Tunisia',
      'tunis, tunisia': 'Tunisia',
      'tunis tunisia': 'Tunisia',
      sousse: 'Tunisia',
      sfax: 'Tunisia',
      // Morocco
      casablanca: 'Morocco',
      rabat: 'Morocco',
      marrakech: 'Morocco',
      fez: 'Morocco',
      // Additional cities from reservations
      'new york, united states': 'United States',
      'new york united states': 'United States',
      'new york, usa': 'United States',
      'new york usa': 'United States',
      'madrid, spain': 'Spain',
      'madrid spain': 'Spain',
      'barcelona, spain': 'Spain',
      'barcelona spain': 'Spain',
      'rome, italy': 'Italy',
      'rome italy': 'Italy',
      // paris keys already defined above, avoid duplicates
      'london, uk': 'United Kingdom',
      'london uk': 'United Kingdom',
      'london, england': 'United Kingdom',
      'london england': 'United Kingdom',
    };

    // Country coordinates mapping (capital city coordinates)
    const countryCoordinates: Record<string, { lat: number; lng: number }> = {
      France: { lat: 48.8566, lng: 2.3522 }, // Paris
      Spain: { lat: 40.4168, lng: -3.7038 }, // Madrid
      Italy: { lat: 41.9028, lng: 12.4964 }, // Rome
      Germany: { lat: 52.52, lng: 13.405 }, // Berlin
      'United Kingdom': { lat: 51.5074, lng: -0.1278 }, // London
      Portugal: { lat: 38.7223, lng: -9.1393 }, // Lisbon
      Greece: { lat: 37.9838, lng: 23.7275 }, // Athens
      Netherlands: { lat: 52.3676, lng: 4.9041 }, // Amsterdam
      Belgium: { lat: 50.8503, lng: 4.3517 }, // Brussels
      Switzerland: { lat: 46.2044, lng: 6.1432 }, // Geneva
      Austria: { lat: 48.2082, lng: 16.3738 }, // Vienna
      'Czech Republic': { lat: 50.0755, lng: 14.4378 }, // Prague
      Poland: { lat: 52.2297, lng: 21.0122 }, // Warsaw
      Hungary: { lat: 47.4979, lng: 19.0402 }, // Budapest
      Croatia: { lat: 45.815, lng: 15.9819 }, // Zagreb
      Tunisia: { lat: 36.8065, lng: 10.1815 }, // Tunis
      Morocco: { lat: 33.9716, lng: -6.8498 }, // Rabat
      Algeria: { lat: 36.7538, lng: 3.0588 }, // Algiers
      Egypt: { lat: 30.0444, lng: 31.2357 }, // Cairo
      Turkey: { lat: 41.0082, lng: 28.9784 }, // Istanbul
      'United States': { lat: 38.9072, lng: -77.0369 }, // Washington DC
      Canada: { lat: 45.5017, lng: -75.5673 }, // Ottawa
      Mexico: { lat: 19.4326, lng: -99.1332 }, // Mexico City
      Brazil: { lat: -15.7942, lng: -47.8822 }, // Brasília
      Argentina: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
      Japan: { lat: 35.6762, lng: 139.6503 }, // Tokyo
      China: { lat: 39.9042, lng: 116.4074 }, // Beijing
      India: { lat: 28.6139, lng: 77.209 }, // New Delhi
      Thailand: { lat: 13.7563, lng: 100.5018 }, // Bangkok
      'South Korea': { lat: 37.5665, lng: 126.978 }, // Seoul
      Australia: { lat: -35.2809, lng: 149.13 }, // Canberra
      'New Zealand': { lat: -41.2865, lng: 174.7762 }, // Wellington
      'United Arab Emirates': { lat: 24.4539, lng: 54.3773 }, // Abu Dhabi
    };

    // Group trips by country
    const countryMap = new Map<
      string,
      {
        country: string;
        lat: number;
        lng: number;
        trips: any[];
        count: number;
      }
    >();

    // Helper function to extract country from text
    const extractCountryFromText = (text: string): string | null => {
      if (!text) return null;
      
      // Normalize text: remove extra spaces, convert to lowercase, trim
      const normalizedText = text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s,]/g, ''); // Remove special characters except commas

      this.logger.debug(`Extracting country from text: "${text}" (normalized: "${normalizedText}")`);

      // First, try to find city and map to country (more specific, check this first)
      // Sort by length (longest first) to match "paris, france" before just "paris"
      const sortedCities = Object.entries(cityToCountry).sort(
        (a, b) => b[0].length - a[0].length,
      );
      for (const [city, country] of sortedCities) {
        // Check if the normalized text contains the city (as whole word or part)
        if (normalizedText.includes(city)) {
          this.logger.debug(`City "${city}" found in text "${text}" -> ${country}`);
          return country;
        }
      }

      // Then, try to find country name directly
      for (const [countryName, _] of Object.entries(countryCoordinates)) {
        const lowerCountryName = countryName.toLowerCase();
        // Check for exact match or contains match
        if (
          normalizedText === lowerCountryName ||
          normalizedText.includes(lowerCountryName)
        ) {
          this.logger.debug(`Country "${countryName}" found in text "${text}"`);
          return countryName;
        }
      }

      // Try to extract country from common patterns like "City, Country" or "City Country"
      // Extract the part after comma or the last word
      const parts = normalizedText.split(',').map(p => p.trim());
      if (parts.length > 1) {
        // If there's a comma, check the part after comma as country
        const possibleCountry = parts[parts.length - 1];
        for (const [countryName, _] of Object.entries(countryCoordinates)) {
          const lowerCountryName = countryName.toLowerCase();
          if (possibleCountry === lowerCountryName || possibleCountry.includes(lowerCountryName)) {
            this.logger.debug(`Country "${countryName}" extracted from pattern in text "${text}"`);
            return countryName;
          }
        }
      }

      // Country not found in text
      this.logger.warn(`No country found in text: "${text}"`);
      return null;
    };

    trips.forEach((trip: any) => {
      const tripObj = trip.toObject ? trip.toObject() : trip;

      this.logger.debug(`Processing trip ${tripObj._id}: title="${tripObj.title}", destination="${tripObj.destination}", metadata=${JSON.stringify(tripObj.metadata)}`);

      // Processing trip for country extraction

      // Extract country from multiple sources
      let country: string | null = null;
      let source = '';

      // 1. Check metadata.country
      if (tripObj.metadata?.country) {
        country = tripObj.metadata.country;
        source = 'metadata.country';
        this.logger.debug(`Country found in metadata.country: ${country}`);
      }
      // 2. Check destination field directly (for Journey objects)
      else if (tripObj.destination) {
        country = extractCountryFromText(tripObj.destination);
        source = 'destination';
        if (country) {
          this.logger.debug(`Country extracted from destination: ${country}`);
        }
      }
      // 3. Check metadata.destination
      else if (tripObj.metadata?.destination) {
        country = extractCountryFromText(tripObj.metadata.destination);
        source = 'metadata.destination';
        if (country) {
          this.logger.debug(`Country extracted from metadata.destination: ${country}`);
        }
      }
      // 4. Check title
      else if (tripObj.title) {
        country = extractCountryFromText(tripObj.title);
        source = 'title';
        if (country) {
          this.logger.debug(`Country extracted from title: ${country}`);
        }
      }
      // 5. Check description
      else if (tripObj.description) {
        country = extractCountryFromText(tripObj.description);
        source = 'description';
        if (country) {
          this.logger.debug(`Country extracted from description: ${country}`);
        }
      }
      // 6. Check tags
      else if (tripObj.tags && tripObj.tags.length > 0) {
        for (const tag of tripObj.tags) {
          country = extractCountryFromText(tag);
          if (country) {
            source = `tags[${tripObj.tags.indexOf(tag)}]`;
            this.logger.debug(`Country extracted from tag: ${country}`);
            break;
          }
        }
      }

      // If no country found, skip this trip
      if (!country) {
        // Log for debugging with all available information
        this.logger.warn(
          `No country found for trip ${tripObj._id}. ` +
          `Title: "${tripObj.title}", ` +
          `Destination: "${tripObj.destination}", ` +
          `Metadata: ${JSON.stringify(tripObj.metadata)}, ` +
          `Description: "${tripObj.description}", ` +
          `Tags: ${JSON.stringify(tripObj.tags)}`
        );
        return;
      }

      // Country successfully detected
      this.logger.debug(`Country "${country}" found for trip ${tripObj._id} from source: ${source}`);

      // Get coordinates for country
      const coords = countryCoordinates[country];
      if (!coords) {
        this.logger.warn(`Country "${country}" found but no coordinates available in mapping for trip ${tripObj._id}`);
        return; // Skip if country not in our mapping
      }

      // Add to country map
      if (!countryMap.has(country)) {
        countryMap.set(country, {
          country,
          lat: coords.lat,
          lng: coords.lng,
          trips: [],
          count: 0,
        });
        this.logger.debug(`Created new country entry for ${country} at (${coords.lat}, ${coords.lng})`);
      }

      const countryData = countryMap.get(country)!;
      countryData.trips.push(tripObj);
      countryData.count = countryData.trips.length;
      this.logger.debug(`Added trip ${tripObj._id} to country ${country}. Total trips for this country: ${countryData.count}`);
    });

    // Convert map to array
    const result = Array.from(countryMap.values());

    return {
      countries: result,
      totalCountries: result.length,
      totalMemories: trips.length,
    };
  }
}
