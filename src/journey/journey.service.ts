import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Journey,
  JourneyDocument,
  JourneyLike,
  JourneyLikeDocument,
  JourneyComment,
  JourneyCommentDocument,
} from './journey.schema';
import { CreateJourneyDto, UpdateJourneyDto, CreateJourneyCommentDto } from './journey.dto';
import { BookingService } from '../booking/booking.service';
import { VideoProcessingService } from '../video-processing/video-processing.service';
import { ImgBBService } from './imgbb.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JourneyService {
  private readonly logger = new Logger(JourneyService.name);

  constructor(
    @InjectModel(Journey.name) private readonly journeyModel: Model<JourneyDocument>,
    @InjectModel(JourneyLike.name) private readonly journeyLikeModel: Model<JourneyLikeDocument>,
    @InjectModel(JourneyComment.name) private readonly journeyCommentModel: Model<JourneyCommentDocument>,
    private readonly bookingService: BookingService,
    private readonly videoProcessingService: VideoProcessingService,
    private readonly imgbbService: ImgBBService,
  ) {}

  private toObjectId(id: string, label: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return id as any;
  }

  /**
   * Upload images to ImgBB and return their URLs
   * @param files - Array of uploaded files from Multer
   * @returns Array of ImgBB URLs
   */
  async uploadImagesToImgBB(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(async (file) => {
        const filePath = path.join(file.destination, file.filename);
        try {
          const imgbbUrl = await this.imgbbService.uploadImage(filePath, file.originalname);
          
          // Clean up local file after successful upload
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              this.logger.debug(`Deleted local file: ${filePath}`);
            }
          } catch (cleanupError) {
            this.logger.warn(`Failed to delete local file ${filePath}: ${cleanupError.message}`);
          }
          
          return imgbbUrl;
        } catch (error) {
          this.logger.error(`Failed to upload image ${file.originalname} to ImgBB: ${error.message}`);
          // If ImgBB fails, fallback to local URL
          const publicBaseUrl = (
            process.env.PUBLIC_BASE_URL ||
            process.env.BASE_URL ||
            'http://localhost:3000'
          ).replace(/\/$/, '');
          return `${publicBaseUrl}/uploads/journeys/${file.filename}`;
        }
      });

      const imageUrls = await Promise.all(uploadPromises);
      this.logger.log(`Successfully processed ${imageUrls.length} images`);
      return imageUrls;
    } catch (error) {
      this.logger.error(`Error uploading images to ImgBB: ${error.message}`, error.stack);
      // Fallback to local URLs if ImgBB service fails
      const publicBaseUrl = (
        process.env.PUBLIC_BASE_URL ||
        process.env.BASE_URL ||
        'http://localhost:3000'
      ).replace(/\/$/, '');
      return files.map((file) => `${publicBaseUrl}/uploads/journeys/${file.filename}`);
    }
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

    const slides =
      dto.slides && dto.slides.length > 0
        ? dto.slides.map((slide) => ({
            imageUrl: slide.imageUrl,
            caption: slide.caption ?? null,
          }))
        : imageUrls.map((url) => ({ imageUrl: url, caption: null }));

    const publicBaseUrl = (
      process.env.PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      'http://localhost:3000'
    ).replace(/\/$/, '');

    const queueSlides = slides.map((slide) => {
      const imageUrl = slide.imageUrl.startsWith('http')
        ? slide.imageUrl
        : `${publicBaseUrl}${slide.imageUrl.startsWith('/') ? '' : '/'}${slide.imageUrl}`;
      return {
        imageUrl,
        caption: slide.caption,
      };
    });

    const journey = new this.journeyModel({
      user_id: this.toObjectId(userId, 'user id'),
      booking_id: this.toObjectId(bookingId, 'booking id'), // Now always required
      destination,
      image_urls: imageUrls,
      slides,
      music_theme: dto.music_theme || null,
      caption_text: dto.caption_text || null,
      description: dto.description || '',
      tags: dto.tags || [],
      is_public: dto.is_public !== undefined ? dto.is_public : true,
      video_status: 'pending',
    });

    const savedJourney = await journey.save();

    try {
      await this.videoProcessingService.enqueueJourneyVideo({
        journeyId: savedJourney._id.toString(),
        userId,
        destination,
        musicTheme: journey.music_theme || null,
        captionText: journey.caption_text || null,
        slides: queueSlides,
      });
    } catch (error) {
      this.logger.error(`Failed to enqueue video job for journey ${savedJourney._id}`, error as Error);
    }

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
        const populatedUserId = journeyObj.user_id as any;
        
        // Transform: keep user_id as string, move populated user data to 'user' field
        const isPopulatedUser = populatedUserId && typeof populatedUserId === 'object' && populatedUserId._id;
        
        return {
          ...journeyObj,
          user_id: isPopulatedUser 
            ? populatedUserId._id.toString() 
            : (populatedUserId?.toString() || journeyObj.user_id?.toString()),
          user: isPopulatedUser
            ? {
                _id: populatedUserId._id.toString(),
                username: populatedUserId.username || '',
                firstName: populatedUserId.firstName || populatedUserId.first_name || '',
                lastName: populatedUserId.lastName || populatedUserId.last_name || '',
                profileImageUrl: populatedUserId.profile_image_url || populatedUserId.profileImageUrl || '',
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
    const populatedUserId = journeyObj.user_id as any;
    
    // Transform: keep user_id as string, move populated user data to 'user' field
    const isPopulatedUser = populatedUserId && typeof populatedUserId === 'object' && populatedUserId._id;
    
    return {
      ...journeyObj,
      user_id: isPopulatedUser 
        ? populatedUserId._id.toString() 
        : (populatedUserId?.toString() || journeyObj.user_id?.toString()),
      user: isPopulatedUser
        ? {
            _id: populatedUserId._id.toString(),
            username: populatedUserId.username || '',
            firstName: populatedUserId.firstName || populatedUserId.first_name || '',
            lastName: populatedUserId.lastName || populatedUserId.last_name || '',
            profileImageUrl: populatedUserId.profile_image_url || populatedUserId.profileImageUrl || '',
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
      const populatedUserId = journeyObj.user_id as any;
      
      // Transform: keep user_id as string, move populated user data to 'user' field
      const isPopulatedUser = populatedUserId && typeof populatedUserId === 'object' && populatedUserId._id;
      
      return {
        ...journeyObj,
        user_id: isPopulatedUser 
          ? populatedUserId._id.toString() 
          : (populatedUserId?.toString() || journeyObj.user_id?.toString()),
        user: isPopulatedUser
          ? {
              _id: populatedUserId._id.toString(),
              username: populatedUserId.username || '',
              firstName: populatedUserId.firstName || populatedUserId.first_name || '',
              lastName: populatedUserId.lastName || populatedUserId.last_name || '',
              profileImageUrl: populatedUserId.profile_image_url || populatedUserId.profileImageUrl || '',
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
    if (dto.music_theme !== undefined) journey.music_theme = dto.music_theme;
    if (dto.caption_text !== undefined) journey.caption_text = dto.caption_text;

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
      const populatedUserId = commentObj.user_id as any;
      
      // Transform: keep user_id as string, move populated user data to 'user' field
      const isPopulatedUser = populatedUserId && typeof populatedUserId === 'object' && populatedUserId._id;
      
      return {
        ...commentObj,
        user_id: isPopulatedUser 
          ? populatedUserId._id.toString() 
          : (populatedUserId?.toString() || commentObj.user_id?.toString()),
        user: isPopulatedUser
          ? {
              _id: populatedUserId._id.toString(),
              username: populatedUserId.username || '',
              firstName: populatedUserId.firstName || populatedUserId.first_name || '',
              lastName: populatedUserId.lastName || populatedUserId.last_name || '',
              profileImageUrl: populatedUserId.profile_image_url || populatedUserId.profileImageUrl || '',
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

}

