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
    await this.videoQueue.add('generate-video', payload, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60_000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}

