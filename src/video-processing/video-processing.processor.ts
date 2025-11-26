import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { Journey, JourneyDocument } from '../journey/journey.schema';
import type { VideoJobPayload } from './interfaces/video-job-payload.interface';
import { AiVideoService } from './ai-video.service';

@Processor('video-montage')
export class VideoProcessingProcessor {
  private readonly logger = new Logger(VideoProcessingProcessor.name);

  constructor(
    @InjectModel(Journey.name)
    private readonly journeyModel: Model<JourneyDocument>,
    private readonly aiVideoService: AiVideoService,
  ) {}

  @Process('generate-video')
  async handleGenerateVideo(job: Job<VideoJobPayload>) {
    const journey = await this.journeyModel.findById(job.data.journeyId).exec();
    if (!journey) {
      return;
    }

    // Set status to processing (frontend will hide video section during this time)
    journey.video_status = 'processing';
    journey.video_url = undefined; // Ensure no URL is set during processing
    await journey.save();

    try {
      const response = await this.aiVideoService.generateVideo(job.data);

      // Only set video_url and status to completed if we have a valid, non-empty URL
      if (response.videoUrl && response.videoUrl.trim().length > 0) {
        // Additional validation: ensure URL is properly formatted
        try {
          new URL(response.videoUrl);
          journey.video_url = response.videoUrl;
          journey.video_status = 'completed';
          this.logger.log(
            `Video generation completed for journey ${job.data.journeyId}: ${response.videoUrl}`,
          );
        } catch (urlError) {
          this.logger.error(
            `Invalid video URL format: ${response.videoUrl}`,
            urlError,
          );
          journey.video_status = 'failed';
          journey.video_url = undefined;
        }
      } else {
        // If no valid URL is returned, mark as failed
        this.logger.warn(
          `No valid video URL returned for journey ${job.data.journeyId}`,
        );
        journey.video_status = 'failed';
        journey.video_url = undefined;
      }
      await journey.save();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error during video generation';
      this.logger.error(
        `Video generation failed for journey ${job.data.journeyId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      journey.video_status = 'failed';
      journey.video_url = undefined; // Ensure no URL is set on failure
      // Store error message in journey metadata if schema supports it
      await journey.save();
      // Don't throw error to prevent job retry - error is already logged and status is set
    }
  }
}
