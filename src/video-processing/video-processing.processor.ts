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

    journey.video_status = 'processing';
    await journey.save();

    try {
      const response = await this.aiVideoService.generateVideo(job.data);
      journey.video_url = response.videoUrl;
      journey.video_status = 'completed';
      await journey.save();
    } catch (error) {
      journey.video_status = 'failed';
      await journey.save();
      throw error;
    }
  }
}

