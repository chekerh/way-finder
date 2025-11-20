import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { VideoJobPayload } from './interfaces/video-job-payload.interface';

interface AiVideoResponse {
  videoUrl: string;
}

@Injectable()
export class AiVideoService {
  private readonly logger = new Logger(AiVideoService.name);

  constructor(private readonly httpService: HttpService) {}

  async generateVideo(payload: VideoJobPayload): Promise<AiVideoResponse> {
    const aiEndpoint = process.env.AI_VIDEO_SERVICE_URL;

    if (aiEndpoint) {
      const response = await firstValueFrom(
        this.httpService.post<AiVideoResponse>(aiEndpoint, {
          journeyId: payload.journeyId,
          destination: payload.destination,
          musicTheme: payload.musicTheme,
          captionText: payload.captionText,
          slides: payload.slides,
        }),
      );

      if (!response.data?.videoUrl) {
        throw new Error('AI video service did not return a video URL');
      }

      return response.data;
    }

    // Fallback: simulate video generation and return placeholder video
    this.logger.warn('AI_VIDEO_SERVICE_URL not configured. Using placeholder video URL.');
    const placeholderUrl =
      process.env.DEFAULT_VIDEO_PLACEHOLDER_URL ||
      'https://storage.googleapis.com/wayfinder-static/sample-journey-video.mp4';

    // Simulate some processing latency
    await new Promise(resolve => setTimeout(resolve, 5000));

    return { videoUrl: placeholderUrl };
  }
}

