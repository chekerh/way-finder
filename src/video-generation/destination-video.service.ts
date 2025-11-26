import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DestinationVideo,
  DestinationVideoDocument,
} from './destination-video.schema';
import { ImageAggregatorService } from './image-aggregator.service';
import { MusicSelectorService } from './music-selector.service';
import { ImgBBService } from '../journey/imgbb.service';
import { AiVideoService } from '../video-processing/ai-video.service';
import { VideoJobPayload } from '../video-processing/interfaces/video-job-payload.interface';

@Injectable()
export class DestinationVideoService {
  private readonly logger = new Logger(DestinationVideoService.name);

  constructor(
    @InjectModel(DestinationVideo.name)
    private readonly destinationVideoModel: Model<DestinationVideoDocument>,
    private readonly imageAggregator: ImageAggregatorService,
    private readonly musicSelector: MusicSelectorService,
    private readonly imgbbService: ImgBBService,
    private readonly aiVideoService: AiVideoService,
  ) {}

  private toObjectId(id: string, label: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return id as any;
  }

  /**
   * Generate video for a user and destination
   */
  async generateVideo(
    userId: string,
    destination: string,
  ): Promise<DestinationVideoDocument> {
    this.logger.log(
      `Generating video for user ${userId} and destination ${destination}`,
    );

    // Check if video already exists
    let destinationVideo = await this.destinationVideoModel
      .findOne({
        user_id: userId,
        destination: destination.trim(),
      })
      .exec();

    if (destinationVideo && destinationVideo.status === 'processing') {
      throw new BadRequestException(
        'Video generation is already in progress for this destination',
      );
    }

    if (
      destinationVideo &&
      destinationVideo.status === 'ready' &&
      destinationVideo.video_url
    ) {
      this.logger.log(
        `Video already exists for user ${userId} and destination ${destination}`,
      );
      return destinationVideo;
    }

    // Aggregate images
    const aggregatedImages =
      await this.imageAggregator.aggregateImagesByDestination(
        userId,
        destination,
      );

    if (aggregatedImages.imageUrls.length === 0) {
      throw new BadRequestException(
        `No images found for destination ${destination}. Please share some journeys first.`,
      );
    }

    // Create or update destination video record
    if (!destinationVideo) {
      destinationVideo = new this.destinationVideoModel({
        user_id: this.toObjectId(userId, 'user id'),
        destination: destination.trim(),
        status: 'processing',
        image_urls: aggregatedImages.imageUrls,
        image_count: aggregatedImages.totalCount,
        metadata: {
          journeyIds: aggregatedImages.journeyIds,
          tags: aggregatedImages.tags,
          descriptions: aggregatedImages.descriptions,
          earliestDate: aggregatedImages.metadata.earliestDate,
          latestDate: aggregatedImages.metadata.latestDate,
        },
      });
    } else {
      destinationVideo.status = 'processing';
      destinationVideo.image_urls = aggregatedImages.imageUrls;
      destinationVideo.image_count = aggregatedImages.totalCount;
      destinationVideo.metadata = {
        journeyIds: aggregatedImages.journeyIds,
        tags: aggregatedImages.tags,
        descriptions: aggregatedImages.descriptions,
        earliestDate: aggregatedImages.metadata.earliestDate,
        latestDate: aggregatedImages.metadata.latestDate,
      };
      destinationVideo.error_message = undefined;
    }

    await destinationVideo.save();

    // Start video generation asynchronously
    this.generateVideoAsync(destinationVideo, aggregatedImages).catch(
      async (error) => {
        const errorMessage =
          error.message || 'Unknown error occurred during video generation';
        const errorStack = error.stack || 'No stack trace available';

        this.logger.error(
          `Video generation failed for user ${userId}, destination ${destination}: ${errorMessage}`,
          errorStack,
        );

        try {
          // Reload the document to ensure we have the latest version
          const updatedVideo = await this.destinationVideoModel
            .findById(destinationVideo._id)
            .exec();
          if (updatedVideo) {
            updatedVideo.status = 'failed';
            updatedVideo.error_message = `Video generation failed: ${errorMessage}. ${errorStack.substring(0, 200)}`;
            await updatedVideo.save();
            this.logger.log(
              `Updated destination video status to failed with error message`,
            );
          }
        } catch (saveError) {
          this.logger.error(
            `Failed to save error message to database: ${saveError.message}`,
          );
        }
      },
    );

    return destinationVideo;
  }

  /**
   * Generate video asynchronously using AI service
   */
  private async generateVideoAsync(
    destinationVideo: DestinationVideoDocument,
    aggregatedImages: any,
  ): Promise<void> {
    let step = 'initialization';
    try {
      step = 'preparing_video_payload';
      this.logger.log('Preparing video generation payload...');

      // Prepare slides for video generation
      const slides = aggregatedImages.imageUrls.map((imageUrl: string) => ({
        imageUrl,
        caption: null, // Can be enhanced later to include captions
      }));

      // Create video job payload
      const videoPayload: VideoJobPayload = {
        journeyId: destinationVideo._id.toString(),
        userId: destinationVideo.user_id.toString(),
        destination: destinationVideo.destination,
        musicTheme: null, // Music selection can be handled by AI service
        captionText: null,
        slides,
      };

      step = 'ai_video_generation';
      this.logger.log('Generating video using AI service...');

      // Generate video using AI service
      const videoResult = await this.aiVideoService.generateVideo(videoPayload);

      if (!videoResult.videoUrl) {
        throw new Error('AI video service did not return a video URL');
      }

      step = 'updating_database';
      // Update destination video record
      destinationVideo.video_url = videoResult.videoUrl;
      destinationVideo.status = 'ready';
      destinationVideo.generated_at = new Date();
      await destinationVideo.save();

      this.logger.log(
        `Video generation completed successfully: ${videoResult.videoUrl}`,
      );
    } catch (error: any) {
      const errorMessage =
        error.message || 'Unknown error occurred during video generation';
      const errorStack = error.stack || 'No stack trace available';
      const stepInfo = step ? ` (failed at step: ${step})` : '';

      this.logger.error(
        `Video generation error${stepInfo}: ${errorMessage}`,
        errorStack,
      );

      // Add more context to the error message
      const detailedError = `Step: ${step}. Error: ${errorMessage}`;

      throw new Error(detailedError);
    }
  }

  /**
   * Get video status for a user and destination
   */
  async getVideoStatus(
    userId: string,
    destination: string,
  ): Promise<DestinationVideoDocument | null> {
    const destinationVideo = await this.destinationVideoModel
      .findOne({
        user_id: this.toObjectId(userId, 'user id'),
        destination: destination.trim(),
      })
      .exec();

    return destinationVideo;
  }

  /**
   * Get all destination videos for a user
   */
  async getUserDestinationVideos(
    userId: string,
  ): Promise<DestinationVideoDocument[]> {
    return this.destinationVideoModel
      .find({
        user_id: this.toObjectId(userId, 'user id'),
      })
      .sort({ destination: 1 })
      .exec();
  }

  /**
   * Get all destinations for a user (with video status)
   */
  async getUserDestinationsWithVideoStatus(userId: string): Promise<
    Array<{
      destination: string;
      videoStatus: 'not_started' | 'processing' | 'ready' | 'failed';
      videoUrl?: string;
      imageCount: number;
    }>
  > {
    const destinations = await this.imageAggregator.getUserDestinations(userId);
    const videos = await this.destinationVideoModel
      .find({
        user_id: this.toObjectId(userId, 'user id'),
        destination: { $in: destinations },
      })
      .exec();

    const videoMap = new Map(videos.map((v) => [v.destination, v]));

    const imageCountMap = new Map<string, number>();
    for (const dest of destinations) {
      const aggregated =
        await this.imageAggregator.aggregateImagesByDestination(userId, dest);
      imageCountMap.set(dest, aggregated.totalCount);
    }

    return destinations.map((destination) => {
      const video = videoMap.get(destination);
      const imageCount = imageCountMap.get(destination) || 0;
      return {
        destination,
        videoStatus: video?.status || 'not_started',
        videoUrl: video?.video_url || undefined,
        imageCount: imageCount,
        errorMessage: video?.error_message || undefined,
      };
    });
  }
}
