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
import { NotificationsService } from '../notifications/notifications.service';
import { UserService } from '../user/user.service';
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
    private readonly notificationsService: NotificationsService,
    private readonly userService: UserService,
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
      // Limit concurrent uploads to avoid overwhelming ImgBB API (max 3 at a time)
      const MAX_CONCURRENT_UPLOADS = 3;
      const imageUrls: string[] = [];
      
      for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
        const batch = files.slice(i, i + MAX_CONCURRENT_UPLOADS);
        const uploadPromises = batch.map(async (file) => {
          const filePath = path.join(file.destination, file.filename);
          try {
            this.logger.debug(`Uploading image ${file.originalname} to ImgBB...`);
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

        const batchUrls = await Promise.all(uploadPromises);
        imageUrls.push(...batchUrls);
        this.logger.log(`Uploaded batch ${Math.floor(i / MAX_CONCURRENT_UPLOADS) + 1}/${Math.ceil(files.length / MAX_CONCURRENT_UPLOADS)}: ${batchUrls.length} images`);
      }

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

    // If destination is provided in DTO, use it directly (from catalog selection)
    if (dto.destination && dto.destination.trim().length > 0) {
      destination = dto.destination.trim();
      
      // Still need a booking_id for the schema, so get the most recent confirmed booking
      // or use the provided booking_id if available
      if (!bookingId) {
        const bookings = await this.bookingService.history(userId);
        const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed');
        
        if (confirmedBookings.length === 0) {
          throw new BadRequestException(
            'You must have at least one confirmed booking to share your journey. Please make a reservation first.'
          );
        }

        // Get the most recent confirmed booking for booking_id
        const confirmedBooking = confirmedBookings
          .sort((a: any, b: any) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())[0];

        bookingId = confirmedBooking._id?.toString() || confirmedBooking.id?.toString() || '';
        booking = confirmedBooking;
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
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new BadRequestException(
            'Invalid booking. Please make sure you have a confirmed reservation before sharing your journey.'
          );
        }
      }
    } else {
      // No destination provided in DTO, use booking-based logic
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
      music_theme: null, // No longer used - removed from UI
      caption_text: null, // No longer used - removed from UI
      description: dto.description || '',
      tags: dto.tags || [],
      is_public: dto.is_public !== undefined ? dto.is_public : true,
      video_status: 'pending',
    });

    const savedJourney = await journey.save();

    // Note: Video generation is disabled - only image posting is supported
    // try {
    //   await this.videoProcessingService.enqueueJourneyVideo({
    //     journeyId: savedJourney._id.toString(),
    //     userId,
    //     destination,
    //     musicTheme: null,
    //     captionText: null,
    //     slides: queueSlides,
    //   });
    // } catch (error) {
    //   this.logger.error(`Failed to enqueue video job for journey ${savedJourney._id}`, error as Error);
    // }

    // Ensure image_urls is always an array
    const journeyObj = savedJourney.toObject ? savedJourney.toObject() : savedJourney;
    return {
      ...journeyObj,
      image_urls: Array.isArray(journeyObj.image_urls) ? journeyObj.image_urls : [],
    };
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
          image_urls: (() => {
            const urls = journeyObj.image_urls;
            if (Array.isArray(urls)) return urls;
            if (typeof urls === 'string') {
              try {
                const parsed = JSON.parse(urls);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            }
            return [];
          })(),
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
      image_urls: (() => {
        const urls = journeyObj.image_urls;
        if (Array.isArray(urls)) return urls;
        if (typeof urls === 'string') {
          try {
            const parsed = JSON.parse(urls);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      })(),
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
        image_urls: (() => {
          const urls = journeyObj.image_urls;
          if (Array.isArray(urls)) return urls;
          if (typeof urls === 'string') {
            try {
              const parsed = JSON.parse(urls);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        })(),
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
    const journey = await this.journeyModel.findById(journeyId).populate('user_id', 'username firstName lastName').exec();

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

    // Send notification to journey owner if it's not the same user
    const journeyOwnerId = journey.user_id.toString();
    if (journeyOwnerId !== userId) {
      try {
        const liker = await this.userService.findById(userId);
        const likerName = liker?.username || liker?.first_name || 'Quelqu\'un';
        await this.notificationsService.createNotification(journeyOwnerId, {
          type: 'journey_liked',
          title: 'Votre voyage a été aimé',
          message: `${likerName} a aimé votre voyage à ${journey.destination}`,
          data: { journeyId: journeyId, likerId: userId },
          actionUrl: `/journey_detail/${journeyId}`,
        });
      } catch (error) {
        // Log error but don't fail the like operation
        console.error('Error sending journey like notification:', error);
      }
    }

    return { liked: true, message: 'Journey liked' };
  }

  async addComment(userId: string, journeyId: string, dto: CreateJourneyCommentDto) {
    const journey = await this.journeyModel.findById(journeyId).populate('user_id', 'username firstName lastName').exec();

    if (!journey || !journey.is_visible) {
      throw new NotFoundException('Journey not found');
    }

    const comment = new this.journeyCommentModel({
      journey_id: journey._id,
      user_id: this.toObjectId(userId, 'user id'),
      content: dto.content,
      parent_comment_id: dto.parent_comment_id ? this.toObjectId(dto.parent_comment_id, 'parent comment id') : undefined,
    });

    const savedComment = await comment.save();

    // Send notification to journey owner if it's not the same user
    const journeyOwnerId = journey.user_id.toString();
    if (journeyOwnerId !== userId) {
      try {
        const commenter = await this.userService.findById(userId);
        const commenterName = commenter?.username || commenter?.first_name || 'Quelqu\'un';
        await this.notificationsService.createNotification(journeyOwnerId, {
          type: 'journey_commented',
          title: 'Nouveau commentaire sur votre voyage',
          message: `${commenterName} a commenté votre voyage à ${journey.destination}`,
          data: { journeyId: journeyId, commentId: savedComment._id.toString(), commenterId: userId },
          actionUrl: `/journey_detail/${journeyId}`,
        });
      } catch (error) {
        // Log error but don't fail the comment operation
        console.error('Error sending journey comment notification:', error);
      }
    }

    return savedComment;
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

  async regenerateVideo(userId: string, journeyId: string) {
    const journey = await this.journeyModel.findById(journeyId).exec();

    if (!journey || !journey.is_visible) {
      throw new NotFoundException('Journey not found');
    }

    // Verify that the journey belongs to the user
    if (journey.user_id.toString() !== userId) {
      throw new ForbiddenException('You can only regenerate videos for your own journeys');
    }

    // Reset video status to pending
    journey.video_status = 'pending';
    journey.video_url = undefined;
    await journey.save();

    // Prepare slides for video generation
    const publicBaseUrl = (
      process.env.PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      'http://localhost:3000'
    ).replace(/\/$/, '');

    const queueSlides = journey.slides.map((slide) => {
      const imageUrl = slide.imageUrl.startsWith('http')
        ? slide.imageUrl
        : `${publicBaseUrl}${slide.imageUrl.startsWith('/') ? '' : '/'}${slide.imageUrl}`;
      return {
        imageUrl,
        caption: slide.caption,
      };
    });

    // Enqueue video generation job
    try {
      await this.videoProcessingService.enqueueJourneyVideo({
        journeyId: journey._id.toString(),
        userId,
        destination: journey.destination,
        musicTheme: journey.music_theme || null,
        captionText: journey.caption_text || null,
        slides: queueSlides,
      });
      this.logger.log(`Video regeneration queued for journey ${journeyId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to enqueue video regeneration for journey ${journeyId}`, error as Error);
      throw error;
    }

    return {
      message: 'Video generation started',
      journey_id: journeyId,
      video_status: 'pending',
    };
  }

}

