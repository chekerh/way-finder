import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import type { VideoJobPayload } from './interfaces/video-job-payload.interface';

@Injectable()
export class VideoProcessingService {
  constructor(
    @InjectQueue('video-montage')
    private readonly videoQueue: Queue<VideoJobPayload>,
  ) {}

  async enqueueJourneyVideo(payload: VideoJobPayload) {
    // Add job with priority and optimized settings for parallel processing
    await this.videoQueue.add('generate-video', payload, {
      attempts: 3, // Reduced attempts for faster failure detection
      backoff: {
        type: 'exponential',
        delay: 30_000, // Reduced delay for faster retries
      },
      removeOnComplete: true,
      removeOnFail: false,
      // Enable parallel processing - BullMQ will process multiple jobs concurrently
      // The number of concurrent workers is controlled by BullMQ configuration
    });
  }
}

