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
    this.generateVideoAsync(destinationVideo, aggregatedImages).catch(async (error) => {
      const errorMessage = error.message || 'Unknown error occurred during video generation';
      const errorStack = error.stack || 'No stack trace available';
      
      this.logger.error(
        `Video generation failed for user ${userId}, destination ${destination}: ${errorMessage}`,
        errorStack,
      );
      
      try {
        // Reload the document to ensure we have the latest version
        const updatedVideo = await this.destinationVideoModel.findById(destinationVideo._id).exec();
        if (updatedVideo) {
          updatedVideo.status = 'failed';
          updatedVideo.error_message = `Video generation failed: ${errorMessage}. ${errorStack.substring(0, 200)}`;
          await updatedVideo.save();
          this.logger.log(`Updated destination video status to failed with error message`);
        }
      } catch (saveError) {
        this.logger.error(`Failed to save error message to database: ${saveError.message}`);
      }
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
    let step = 'initialization';
    try {
      step = 'music_selection';
      // Select and download music
      this.logger.log('Selecting music...');
      const musicResult = await this.musicSelector.selectAndDownloadMusic(
        destinationVideo.destination,
        aggregatedImages.tags,
        60, // Default duration
      );
      this.logger.log(`Music selected: ${musicResult.source} from ${musicResult.originalUrl}`);

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
      step = 'python_execution';
      this.logger.log('Running Python video generator...');
      this.logger.debug(`Python script path: ${this.pythonScriptPath}`);
      this.logger.debug(`Number of images: ${aggregatedImages.imageUrls.length}`);
      
      let stdout: string;
      let stderr: string;
      try {
        const execResult = await execAsync(
          `python3 "${this.pythonScriptPath}" '${configJson.replace(/'/g, "'\\''")}'`,
          {
            timeout: 600000, // 10 minutes timeout
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          },
        );
        stdout = execResult.stdout;
        stderr = execResult.stderr || '';
      } catch (execError: any) {
        // Handle execution errors (timeout, command not found, etc.)
        const errorMsg = execError.message || 'Unknown execution error';
        const errorCode = execError.code || 'UNKNOWN';
        throw new Error(
          `Python script execution failed at step ${step}: ${errorMsg} (code: ${errorCode}). ` +
          `Stderr: ${execError.stderr || 'No stderr'}. ` +
          `Stdout: ${execError.stdout || 'No stdout'}`,
        );
      }

      if (stderr && !stderr.includes('WARNING') && !stderr.includes('INFO')) {
        this.logger.warn(`Python script stderr: ${stderr.substring(0, 500)}`);
      }

      // Parse result
      step = 'result_parsing';
      let result: any;
      try {
        result = JSON.parse(stdout);
      } catch (parseError: any) {
        throw new Error(
          `Failed to parse Python script output at step ${step}: ${parseError.message}. ` +
          `Output: ${stdout.substring(0, 500)}`,
        );
      }
      
      if (!result.success) {
        throw new Error(
          `Video generation failed at step ${step}: ${result.error || 'Unknown error from Python script'}. ` +
          `Script output: ${stdout.substring(0, 500)}`,
        );
      }

      // Verify video file exists
      step = 'video_verification';
      if (!result.video_path || !fs.existsSync(result.video_path)) {
        throw new Error(
          `Video file not found at path: ${result.video_path || 'undefined'}. ` +
          `Python script reported success but file is missing.`,
        );
      }

      // Upload video to cloud storage (ImgBB)
      step = 'video_upload';
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

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during video generation';
      const errorStack = error.stack || 'No stack trace available';
      const stepInfo = step ? ` (failed at step: ${step})` : '';
      
      this.logger.error(
        `Video generation error${stepInfo}: ${errorMessage}`,
        errorStack,
      );
      
      // Add more context to the error message
      const detailedError = `Step: ${step}. Error: ${errorMessage}. ` +
        (error.code ? `Error code: ${error.code}. ` : '') +
        (error.stderr ? `Stderr: ${error.stderr.substring(0, 200)}. ` : '');
      
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

    const imageCountMap = new Map<string, number>();
    for (const dest of destinations) {
      const aggregated = await this.imageAggregator.aggregateImagesByDestination(userId, dest);
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

