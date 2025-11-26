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
}
