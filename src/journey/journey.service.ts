import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Journey, JourneyDocument, JourneyLike, JourneyLikeDocument, JourneyComment, JourneyCommentDocument } from './journey.schema';
import { CreateJourneyDto, UpdateJourneyDto, CreateJourneyCommentDto } from './journey.dto';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class JourneyService {
  private readonly logger = new Logger(JourneyService.name);

  constructor(
    @InjectModel(Journey.name) private readonly journeyModel: Model<JourneyDocument>,
    @InjectModel(JourneyLike.name) private readonly journeyLikeModel: Model<JourneyLikeDocument>,
    @InjectModel(JourneyComment.name) private readonly journeyCommentModel: Model<JourneyCommentDocument>,
    private readonly bookingService: BookingService,
  ) {}

  private toObjectId(id: string, label: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return id as any;
  }

  async createJourney(userId: string, dto: CreateJourneyDto, imageUrls: string[]) {
    if (!imageUrls || imageUrls.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    let bookingId = dto.booking_id;
    let destination: string;
    let booking: any;

    // REQUIRE: User must have at least one confirmed booking to share a journey
    if (!bookingId) {
      // Auto-link to user's most recent confirmed booking
      const bookings = await this.bookingService.history(userId);
      const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed');
      
      if (confirmedBookings.length === 0) {
        throw new BadRequestException(
          'You must have at least one confirmed booking to share your journey. Please make a reservation first.'
        );
      }

      // Get the most recent confirmed booking
      const confirmedBooking = confirmedBookings
        .sort((a: any, b: any) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())[0];

      bookingId = confirmedBooking._id?.toString() || confirmedBooking.id?.toString() || '';
      booking = confirmedBooking;
      destination = confirmedBooking.trip_details?.destination || 
                   'Unknown Destination';
    } else {
      // Verify that the provided booking exists and belongs to the user
      try {
        booking = await this.bookingService.findOne(userId, bookingId);
        
        // Verify booking is confirmed
        if (booking.status !== 'confirmed') {
          throw new BadRequestException(
            'You can only share journeys from confirmed bookings. Please wait for your booking to be confirmed.'
          );
        }
        
        destination = booking.trip_details?.destination || 
                     'Unknown Destination';
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException(
          'Invalid booking. Please make sure you have a confirmed reservation before sharing your journey.'
        );
      }
    }

    // Ensure bookingId is valid
    if (!bookingId) {
      throw new BadRequestException(
        'Unable to link journey to a booking. Please make a reservation first.'
      );
    }

    const journey = new this.journeyModel({
      user_id: this.toObjectId(userId, 'user id'),
      booking_id: this.toObjectId(bookingId, 'booking id'), // Now always required
      destination,
      image_urls: imageUrls,
      description: dto.description || '',
      tags: dto.tags || [],
      is_public: dto.is_public !== undefined ? dto.is_public : true,
      video_status: 'pending',
    });

    const savedJourney = await journey.save();

    // Trigger video generation asynchronously
    this.generateVideoAsync(savedJourney._id.toString(), imageUrls).catch((error) => {
      this.logger.error(`Failed to generate video for journey ${savedJourney._id}:`, error);
    });

    return savedJourney;
  }

  async getJourneys(userId?: string, limit: number = 20, skip: number = 0) {
    const query: any = { is_visible: true, is_public: true };
    
    if (userId) {
      // Include user's own journeys even if private
      query.$or = [
        { is_public: true, is_visible: true },
        { user_id: this.toObjectId(userId, 'user id'), is_visible: true },
      ];
    }

    const journeys = await this.journeyModel
      .find(query)
      .populate('user_id', 'username firstName lastName profile_image_url')
      .populate('booking_id')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    // Get like and comment counts and transform data
    const journeysWithCounts = await Promise.all(
      journeys.map(async (journey) => {
        const likesCount = await this.journeyLikeModel.countDocuments({ journey_id: journey._id });
        const commentsCount = await this.journeyCommentModel.countDocuments({ journey_id: journey._id });
        
        const journeyObj = journey.toObject ? journey.toObject() : journey;
        const populatedUserId = journeyObj.user_id;
        
        // Transform: keep user_id as string, move populated user data to 'user' field
        return {
          ...journeyObj,
          user_id: typeof populatedUserId === 'object' && populatedUserId?._id 
            ? populatedUserId._id.toString() 
            : (populatedUserId?.toString() || journeyObj.user_id?.toString()),
          user: typeof populatedUserId === 'object' && populatedUserId?._id 
            ? {
                _id: populatedUserId._id.toString(),
                username: populatedUserId.username,
                firstName: populatedUserId.firstName || populatedUserId.first_name,
                lastName: populatedUserId.lastName || populatedUserId.last_name,
                profileImageUrl: populatedUserId.profile_image_url || populatedUserId.profileImageUrl,
              }
            : null,
          booking_id: journeyObj.booking_id?.toString() || journeyObj.booking_id,
          likes_count: likesCount,
          comments_count: commentsCount,
        };
      }),
    );

    return journeysWithCounts;
  }

  async getJourneyById(journeyId: string, userId?: string) {
    const journey = await this.journeyModel
      .findById(journeyId)
      .populate('user_id', 'username firstName lastName profile_image_url')
      .populate('booking_id')
      .exec();

    if (!journey || !journey.is_visible) {
      throw new NotFoundException('Journey not found');
    }

    // Check if user can view (public or own)
    if (!journey.is_public && journey.user_id.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to view this journey');
    }

    const likesCount = await this.journeyLikeModel.countDocuments({ journey_id: journey._id });
    const commentsCount = await this.journeyCommentModel.countDocuments({ journey_id: journey._id });
    const isLiked = userId ? await this.journeyLikeModel.exists({ journey_id: journey._id, user_id: this.toObjectId(userId, 'user id') }) : false;

    const journeyObj = journey.toObject ? journey.toObject() : journey;
    const populatedUserId = journeyObj.user_id;
    
    // Transform: keep user_id as string, move populated user data to 'user' field
    return {
      ...journeyObj,
      user_id: typeof populatedUserId === 'object' && populatedUserId?._id 
        ? populatedUserId._id.toString() 
        : (populatedUserId?.toString() || journeyObj.user_id?.toString()),
      user: typeof populatedUserId === 'object' && populatedUserId?._id 
        ? {
            _id: populatedUserId._id.toString(),
            username: populatedUserId.username,
            firstName: populatedUserId.firstName || populatedUserId.first_name,
            lastName: populatedUserId.lastName || populatedUserId.last_name,
            profileImageUrl: populatedUserId.profile_image_url || populatedUserId.profileImageUrl,
          }
        : null,
      booking_id: journeyObj.booking_id?.toString() || journeyObj.booking_id,
      likes_count: likesCount,
      comments_count: commentsCount,
      is_liked: !!isLiked,
    };
  }

  async canUserShareJourney(userId: string) {
    try {
      const bookings = await this.bookingService.history(userId);
      const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed');
      
      return {
        canShare: confirmedBookings.length > 0,
        confirmedBookingsCount: confirmedBookings.length,
        message: confirmedBookings.length > 0 
          ? 'Vous pouvez partager votre voyage' 
          : 'Vous devez avoir au moins une réservation confirmée pour partager votre voyage',
      };
    } catch (error) {
      this.logger.error(`Error checking can share journey for user ${userId}:`, error);
      // Return a safe default response instead of throwing
      return {
        canShare: false,
        confirmedBookingsCount: 0,
        message: 'Impossible de vérifier le statut de vos réservations. Réessayez plus tard.',
      };
    }
  }

  async getUserJourneys(userId: string, limit: number = 20, skip: number = 0) {
    const journeys = await this.journeyModel
      .find({ user_id: this.toObjectId(userId, 'user id'), is_visible: true })
      .populate('user_id', 'username firstName lastName profile_image_url')
      .populate('booking_id')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    return journeys.map((journey) => {
      const journeyObj = journey.toObject ? journey.toObject() : journey;
      const populatedUserId = journeyObj.user_id;
      
      // Transform: keep user_id as string, move populated user data to 'user' field
      return {
        ...journeyObj,
        user_id: typeof populatedUserId === 'object' && populatedUserId?._id 
          ? populatedUserId._id.toString() 
          : (populatedUserId?.toString() || journeyObj.user_id?.toString()),
        user: typeof populatedUserId === 'object' && populatedUserId?._id 
          ? {
              _id: populatedUserId._id.toString(),
              username: populatedUserId.username,
              firstName: populatedUserId.firstName || populatedUserId.first_name,
              lastName: populatedUserId.lastName || populatedUserId.last_name,
              profileImageUrl: populatedUserId.profile_image_url || populatedUserId.profileImageUrl,
            }
          : null,
        booking_id: journeyObj.booking_id?.toString() || journeyObj.booking_id,
      };
    });
  }

  async updateJourney(userId: string, journeyId: string, dto: UpdateJourneyDto) {
    const journey = await this.journeyModel.findById(journeyId).exec();

    if (!journey || !journey.is_visible) {
      throw new NotFoundException('Journey not found');
    }

    if (journey.user_id.toString() !== userId) {
      throw new ForbiddenException('You can only update your own journeys');
    }

    if (dto.description !== undefined) journey.description = dto.description;
    if (dto.tags !== undefined) journey.tags = dto.tags;
    if (dto.is_public !== undefined) journey.is_public = dto.is_public;

    return journey.save();
  }

  async deleteJourney(userId: string, journeyId: string) {
    const journey = await this.journeyModel.findById(journeyId).exec();

    if (!journey || !journey.is_visible) {
      throw new NotFoundException('Journey not found');
    }

    if (journey.user_id.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own journeys');
    }

    journey.is_visible = false;
    return journey.save();
  }

  async likeJourney(userId: string, journeyId: string) {
    const journey = await this.journeyModel.findById(journeyId).exec();

    if (!journey || !journey.is_visible) {
      throw new NotFoundException('Journey not found');
    }

    const existingLike = await this.journeyLikeModel.findOne({
      journey_id: journey._id,
      user_id: this.toObjectId(userId, 'user id'),
    }).exec();

    if (existingLike) {
      await this.journeyLikeModel.deleteOne({ _id: existingLike._id }).exec();
      return { liked: false, message: 'Journey unliked' };
    }

    await this.journeyLikeModel.create({
      journey_id: journey._id,
      user_id: this.toObjectId(userId, 'user id'),
    });

    return { liked: true, message: 'Journey liked' };
  }

  async addComment(userId: string, journeyId: string, dto: CreateJourneyCommentDto) {
    const journey = await this.journeyModel.findById(journeyId).exec();

    if (!journey || !journey.is_visible) {
      throw new NotFoundException('Journey not found');
    }

    const comment = new this.journeyCommentModel({
      journey_id: journey._id,
      user_id: this.toObjectId(userId, 'user id'),
      content: dto.content,
      parent_comment_id: dto.parent_comment_id ? this.toObjectId(dto.parent_comment_id, 'parent comment id') : undefined,
    });

    return comment.save();
  }

  async getComments(journeyId: string, limit: number = 50, skip: number = 0) {
    const comments = await this.journeyCommentModel
      .find({ journey_id: this.toObjectId(journeyId, 'journey id') })
      .populate('user_id', 'username firstName lastName profile_image_url')
      .populate('parent_comment_id')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    return comments.map((comment) => {
      const commentObj = comment.toObject ? comment.toObject() : comment;
      const populatedUserId = commentObj.user_id;
      
      // Transform: keep user_id as string, move populated user data to 'user' field
      return {
        ...commentObj,
        user_id: typeof populatedUserId === 'object' && populatedUserId?._id 
          ? populatedUserId._id.toString() 
          : (populatedUserId?.toString() || commentObj.user_id?.toString()),
        user: typeof populatedUserId === 'object' && populatedUserId?._id 
          ? {
              _id: populatedUserId._id.toString(),
              username: populatedUserId.username,
              firstName: populatedUserId.firstName || populatedUserId.first_name,
              lastName: populatedUserId.lastName || populatedUserId.last_name,
              profileImageUrl: populatedUserId.profile_image_url || populatedUserId.profileImageUrl,
            }
          : null,
        journey_id: commentObj.journey_id?.toString() || commentObj.journey_id,
        parent_comment_id: commentObj.parent_comment_id?.toString() || commentObj.parent_comment_id,
      };
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.journeyCommentModel.findById(commentId).exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.journeyCommentModel.deleteOne({ _id: commentId }).exec();
    return { message: 'Comment deleted successfully' };
  }

  // Video generation (placeholder - integrate with AI service)
  private async generateVideoAsync(journeyId: string, imageUrls: string[]) {
    try {
      // Update status to processing
      await this.journeyModel.findByIdAndUpdate(journeyId, {
        video_status: 'processing',
      }).exec();

      // TODO: Integrate with AI video generation service
      // For now, this is a placeholder that simulates video generation
      // In production, you would:
      // 1. Use a service like Cloudinary, AWS Rekognition, or custom AI model
      // 2. Process images to create a video montage
      // 3. Upload the video to cloud storage
      // 4. Update the journey with the video URL

      this.logger.log(`Starting video generation for journey ${journeyId} with ${imageUrls.length} images`);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // For now, we'll leave video_url as null and status as 'processing'
      // In production, update with actual video URL:
      // const videoUrl = await this.aiVideoService.generateVideo(imageUrls);
      // await this.journeyModel.findByIdAndUpdate(journeyId, {
      //   video_url: videoUrl,
      //   video_status: 'completed',
      // }).exec();

      // Placeholder: Mark as completed with no video (can be implemented later)
      await this.journeyModel.findByIdAndUpdate(journeyId, {
        video_status: 'completed',
      }).exec();

      this.logger.log(`Video generation completed for journey ${journeyId}`);
    } catch (error) {
      this.logger.error(`Video generation failed for journey ${journeyId}:`, error);
      await this.journeyModel.findByIdAndUpdate(journeyId, {
        video_status: 'failed',
      }).exec();
    }
  }
}

