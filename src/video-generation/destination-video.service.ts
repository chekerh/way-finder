import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DestinationVideo, DestinationVideoDocument } from './destination-video.schema';
import { ImageAggregatorService } from './image-aggregator.service';
import { MusicSelectorService } from './music-selector.service';
import { ImgBBService } from '../journey/imgbb.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class DestinationVideoService {
  private readonly logger = new Logger(DestinationVideoService.name);
  private readonly pythonScriptPath: string;
  private readonly videoOutputDir: string;

  constructor(
    @InjectModel(DestinationVideo.name)
    private readonly destinationVideoModel: Model<DestinationVideoDocument>,
    private readonly imageAggregator: ImageAggregatorService,
    private readonly musicSelector: MusicSelectorService,
    private readonly imgbbService: ImgBBService,
  ) {
    // Path to Python video generator script
    this.pythonScriptPath = path.join(
      process.cwd(),
      'video_generation',
      'video_generator.py',
    );
    
    // Video output directory
    this.videoOutputDir = path.join(process.cwd(), 'uploads', 'destination-videos');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.videoOutputDir)) {
      fs.mkdirSync(this.videoOutputDir, { recursive: true });
    }
  }

  private toObjectId(id: string, label: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return id as any;
  }

  /**
   * Generate video for a user and destination
   */
  async generateVideo(userId: string, destination: string): Promise<DestinationVideoDocument> {
    this.logger.log(`Generating video for user ${userId} and destination ${destination}`);

    // Check if video already exists
    let destinationVideo = await this.destinationVideoModel.findOne({
      user_id: userId,
      destination: destination.trim(),
    }).exec();

    if (destinationVideo && destinationVideo.status === 'processing') {
      throw new BadRequestException('Video generation is already in progress for this destination');
    }

    if (destinationVideo && destinationVideo.status === 'ready' && destinationVideo.video_url) {
      this.logger.log(`Video already exists for user ${userId} and destination ${destination}`);
      return destinationVideo;
    }

    // Aggregate images
    const aggregatedImages = await this.imageAggregator.aggregateImagesByDestination(
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
    this.generateVideoAsync(destinationVideo, aggregatedImages).catch((error) => {
      this.logger.error(`Video generation failed: ${error.message}`, error.stack);
      destinationVideo.status = 'failed';
      destinationVideo.error_message = error.message;
      destinationVideo.save();
    });

    return destinationVideo;
  }

  /**
   * Generate video asynchronously
   */
  private async generateVideoAsync(
    destinationVideo: DestinationVideoDocument,
    aggregatedImages: any,
  ): Promise<void> {
    try {
      // Select and download music
      this.logger.log('Selecting music...');
      const musicResult = await this.musicSelector.selectAndDownloadMusic(
        destinationVideo.destination,
        aggregatedImages.tags,
        60, // Default duration
      );

      // Prepare Python script config
      const config = {
        user_id: destinationVideo.user_id.toString(),
        destination: destinationVideo.destination,
        image_urls: aggregatedImages.imageUrls,
        music_file_path: musicResult.filePath,
        output_dir: this.videoOutputDir,
        metadata: {
          tags: aggregatedImages.tags,
          descriptions: aggregatedImages.descriptions,
        },
      };

      const configJson = JSON.stringify(config);

      // Run Python video generator
      this.logger.log('Running Python video generator...');
      const { stdout, stderr } = await execAsync(
        `python3 "${this.pythonScriptPath}" '${configJson.replace(/'/g, "'\\''")}'`,
        {
          timeout: 600000, // 10 minutes timeout
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        },
      );

      if (stderr && !stderr.includes('WARNING')) {
        this.logger.warn(`Python script stderr: ${stderr}`);
      }

      // Parse result
      const result = JSON.parse(stdout);
      
      if (!result.success) {
        throw new Error(result.error || 'Video generation failed');
      }

      // Upload video to cloud storage (ImgBB)
      this.logger.log('Uploading video to ImgBB...');
      const videoFileName = path.basename(result.video_path);
      let videoUrl: string | null = null;

      try {
        // Try to upload to ImgBB (may not support videos, but we try)
        const imgbbUrl = await this.imgbbService.uploadVideo(
          result.video_path,
          `destination-video-${destinationVideo.user_id}-${destinationVideo.destination}-${Date.now()}.mp4`,
        );

        if (imgbbUrl) {
          videoUrl = imgbbUrl;
          this.logger.log(`Video uploaded successfully to ImgBB: ${videoUrl}`);
        } else {
          // Fallback to local/public URL if ImgBB doesn't support videos
          this.logger.warn('ImgBB upload failed or not supported. Using local URL as fallback.');
          const publicBaseUrl = (
            process.env.PUBLIC_BASE_URL ||
            process.env.BASE_URL ||
            'http://localhost:3000'
          ).replace(/\/$/, '');
          videoUrl = `${publicBaseUrl}/uploads/destination-videos/${videoFileName}`;
          this.logger.warn(`Using local URL: ${videoUrl} (Note: On Render, this will be lost on redeploy)`);
        }
      } catch (uploadError) {
        // If upload fails, use local URL as fallback
        this.logger.error(`Video upload to ImgBB failed: ${uploadError.message}. Using local URL as fallback.`);
        const publicBaseUrl = (
          process.env.PUBLIC_BASE_URL ||
          process.env.BASE_URL ||
          'http://localhost:3000'
        ).replace(/\/$/, '');
        videoUrl = `${publicBaseUrl}/uploads/destination-videos/${videoFileName}`;
      }

      // Update destination video record
      destinationVideo.video_url = videoUrl;
      destinationVideo.status = 'ready';
      destinationVideo.music_url = musicResult.originalUrl;
      destinationVideo.music_source = musicResult.source;
      destinationVideo.generated_at = new Date();
      await destinationVideo.save();

      this.logger.log(`Video generation completed successfully: ${videoUrl}`);

      // Clean up local video file if uploaded to cloud storage
      // Keep it for now in case of fallback, but in production with cloud storage, we can delete it
      // if (imgbbUrl && fs.existsSync(result.video_path)) {
      //   try {
      //     fs.unlinkSync(result.video_path);
      //     this.logger.log(`Deleted local video file: ${result.video_path}`);
      //   } catch (cleanupError) {
      //     this.logger.warn(`Failed to delete local video file: ${cleanupError.message}`);
      //   }
      // }

      // Clean up music file after use
      if (musicResult.filePath && fs.existsSync(musicResult.filePath)) {
        try {
          fs.unlinkSync(musicResult.filePath);
        } catch (error) {
          this.logger.warn(`Failed to delete music file: ${error.message}`);
        }
      }

    } catch (error) {
      this.logger.error(`Video generation error: ${error.message}`, error.stack);
      throw error;
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
  async getUserDestinationVideos(userId: string): Promise<DestinationVideoDocument[]> {
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

    const videoMap = new Map(
      videos.map((v) => [v.destination, v]),
    );

    return destinations.map((destination) => {
      const video = videoMap.get(destination);
      return {
        destination,
        videoStatus: video?.status || 'not_started',
        videoUrl: video?.video_url || undefined,
        imageCount: video?.image_count || 0,
      };
    });
  }
}

