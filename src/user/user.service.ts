import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './user.dto';

/**
 * User Service
 * Handles all user-related operations including CRUD, authentication helpers, and profile management
 */
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new user
   * @param createUserDto - User creation data
   * @returns Created user document
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Remove google_id if it's not provided to avoid sparse index issues with null values
    // The schema now uses default: undefined instead of default: null, but we still
    // want to ensure it's completely omitted if not provided
    const userData: any = { ...createUserDto };
    
    // Explicitly remove google_id if it's undefined, null, or empty string
    // This ensures the field is truly omitted from the document
    if (!userData.google_id || userData.google_id === null || userData.google_id === '') {
      delete userData.google_id;
    }
    
    // Create the document - with default: undefined in schema, Mongoose won't set it to null
    const created = new this.userModel(userData);
    return await created.save();
  }

  /**
   * Find user by username (case-sensitive, trimmed)
   * @param username - Username to search for
   * @returns User document or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    // Normalize username by trimming
    const normalizedUsername = username.trim();
    return this.userModel.findOne({ username: normalizedUsername }).exec();
  }

  /**
   * Find user by email (case-insensitive, normalized to lowercase)
   * @param email - Email address to search for
   * @returns User document or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    // Normalize email to lowercase to match schema behavior
    const normalizedEmail = email.trim().toLowerCase();
    return this.userModel.findOne({ email: normalizedEmail }).exec();
  }

  /**
   * Find user by Google OAuth ID
   * @param googleId - Google user ID
   * @returns User document or null if not found
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ google_id: googleId }).exec();
  }

  /**
   * Find user by email verification token
   * @param token - Email verification token
   * @returns User document or null if not found
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ email_verification_token: token }).exec();
  }

  /**
   * Find user by MongoDB ObjectId
   * @param id - User ID (ObjectId string)
   * @returns User document or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Update user's Google OAuth ID (links Google account to existing user)
   * @param userId - User ID
   * @param googleId - Google user ID to link
   * @returns Updated user document
   * @throws NotFoundException if user not found
   */
  async updateGoogleId(userId: string, googleId: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { google_id: googleId } },
        { new: true, runValidators: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  /**
   * Mark user's email as verified
   * Removes verification token and sets verified status
   * @param userId - User ID
   * @returns Updated user document
   * @throws NotFoundException if user not found
   */
  async verifyEmail(userId: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            email_verified: true,
            email_verified_at: new Date(),
          },
          $unset: { email_verification_token: '' },
        },
        { new: true, runValidators: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async updateVerificationToken(userId: string, token: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { email_verification_token: token } },
        { new: true, runValidators: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updatePayload: Partial<User> = { ...updateUserDto };

    if (updatePayload.email) {
      updatePayload.email = updatePayload.email.toLowerCase();
    }

    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updatePayload },
        { new: true, runValidators: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { fcm_token: fcmToken } },
        { new: true, runValidators: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async getFcmToken(userId: string): Promise<string | null> {
    const user = await this.userModel
      .findById(userId)
      .select('fcm_token')
      .exec();
    return user?.fcm_token || null;
  }

  /**
   * Update day streak when user logs in or performs an activity
   * Returns the updated streak count
   */
  async updateDayStreak(userId: string): Promise<{
    current_streak: number;
    longest_streak: number;
    streak_updated: boolean;
  }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = user.last_login_date
      ? new Date(user.last_login_date)
      : null;
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
    }

    let currentStreak = user.current_streak || 0;
    let longestStreak = user.longest_streak || 0;
    let streakUpdated = false;

    if (!lastLogin) {
      // First login ever
      currentStreak = 1;
      longestStreak = 1;
      streakUpdated = true;
    } else {
      const daysDiff = Math.floor(
        (today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 0) {
        // Same day - no change
        currentStreak = user.current_streak || 0;
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        currentStreak = (user.current_streak || 0) + 1;
        longestStreak = Math.max(currentStreak, user.longest_streak || 0);
        streakUpdated = true;
      } else {
        // Streak broken - reset to 1
        currentStreak = 1;
        streakUpdated = true;
      }
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_login_date: today,
      },
    });

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      streak_updated: streakUpdated,
    };
  }

  /**
   * Increment lifetime metrics
   */
  async incrementLifetimeMetric(
    userId: string,
    metric:
      | 'total_bookings'
      | 'total_destinations'
      | 'total_travel_days'
      | 'total_distance_km'
      | 'total_countries'
      | 'total_outfits_analyzed'
      | 'total_posts_shared',
    amount: number = 1,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { [metric]: amount },
    });
  }
}
