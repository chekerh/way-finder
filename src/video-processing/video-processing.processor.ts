import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Journey, JourneyDocument } from '../journey/journey.schema';
import type { VideoJobPayload } from './interfaces/video-job-payload.interface';
import { AiVideoService } from './ai-video.service';

@Processor('video-montage')
export class VideoProcessingProcessor {
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
        journey.video_url = response.videoUrl;
        journey.video_status = 'completed';
      } else {
        // If no valid URL is returned, mark as failed
        journey.video_status = 'failed';
        journey.video_url = undefined;
      }
      await journey.save();
    } catch (error) {
      journey.video_status = 'failed';
      journey.video_url = undefined; // Ensure no URL is set on failure
      await journey.save();
      throw error;
    }
  }
}

