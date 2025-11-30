import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserFollow, UserFollowDocument } from './social.schema';
import { SharedTrip, SharedTripDocument } from './social.schema';
import { FollowUserDto, ShareTripDto, UpdateSharedTripDto } from './social.dto';

@Injectable()
export class SocialService {
  constructor(
    @InjectModel(UserFollow.name)
    private readonly userFollowModel: Model<UserFollowDocument>,
    @InjectModel(SharedTrip.name)
    private readonly sharedTripModel: Model<SharedTripDocument>,
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
    // Get all shared trips for the user
    const trips = await this.sharedTripModel
      .find({ userId, isVisible: true })
      .populate('userId', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .exec();

    // City to Country mapping (popular cities)
    const cityToCountry: Record<string, string> = {
      // France
      paris: 'France',
      lyon: 'France',
      marseille: 'France',
      nice: 'France',
      // Italy
      rome: 'Italy',
      milan: 'Italy',
      venice: 'Italy',
      florence: 'Italy',
      naples: 'Italy',
      // Spain
      madrid: 'Spain',
      barcelona: 'Spain',
      seville: 'Spain',
      valencia: 'Spain',
      // Brazil
      'rio de janeiro': 'Brazil',
      'rio': 'Brazil',
      sao paulo: 'Brazil',
      brasilia: 'Brazil',
      salvador: 'Brazil',
      // United States
      'new york': 'United States',
      'los angeles': 'United States',
      chicago: 'United States',
      miami: 'United States',
      // United Kingdom
      london: 'United Kingdom',
      manchester: 'United Kingdom',
      edinburgh: 'United Kingdom',
      // Germany
      berlin: 'Germany',
      munich: 'Germany',
      hamburg: 'Germany',
      // Other
      dubai: 'United Arab Emirates',
      istanbul: 'Turkey',
      tokyo: 'Japan',
      bangkok: 'Thailand',
      singapore: 'Singapore',
      sydney: 'Australia',
      melbourne: 'Australia',
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
      const lowerText = text.toLowerCase();
      
      // First, try to find country name directly
      for (const [countryName, _] of Object.entries(countryCoordinates)) {
        if (lowerText.includes(countryName.toLowerCase())) {
          return countryName;
        }
      }
      
      // Then, try to find city and map to country
      for (const [city, country] of Object.entries(cityToCountry)) {
        if (lowerText.includes(city)) {
          return country;
        }
      }
      
      return null;
    };

    trips.forEach((trip: any) => {
      const tripObj = trip.toObject ? trip.toObject() : trip;
      
      // Extract country from multiple sources
      let country: string | null = null;
      
      // 1. Check metadata.country
      if (tripObj.metadata?.country) {
        country = tripObj.metadata.country;
      }
      // 2. Check metadata.destination
      else if (tripObj.metadata?.destination) {
        country = extractCountryFromText(tripObj.metadata.destination);
      }
      // 3. Check title
      else if (tripObj.title) {
        country = extractCountryFromText(tripObj.title);
      }
      // 4. Check description
      else if (tripObj.description) {
        country = extractCountryFromText(tripObj.description);
      }
      // 5. Check tags
      else if (tripObj.tags && tripObj.tags.length > 0) {
        for (const tag of tripObj.tags) {
          country = extractCountryFromText(tag);
          if (country) break;
        }
      }

      // If no country found, skip this trip
      if (!country) {
        return;
      }

      // Get coordinates for country
      const coords = countryCoordinates[country];
      if (!coords) {
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
      }

      const countryData = countryMap.get(country)!;
      countryData.trips.push(tripObj);
      countryData.count = countryData.trips.length;
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
