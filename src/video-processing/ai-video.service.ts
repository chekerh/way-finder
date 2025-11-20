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
      this.logger.log(`Generating video for journey ${payload.journeyId} with ${payload.slides.length} slides`);
      
      try {
        // Use a longer timeout for AI video generation (5 minutes)
        const response = await firstValueFrom(
          this.httpService.post<AiVideoResponse>(
            aiEndpoint,
            {
              journeyId: payload.journeyId,
              destination: payload.destination,
              musicTheme: payload.musicTheme,
              captionText: payload.captionText,
              slides: payload.slides,
            },
            {
              timeout: 300000, // 5 minutes timeout
            },
          ),
        );

        if (!response.data?.videoUrl) {
          throw new Error('AI video service did not return a video URL');
        }

        this.logger.log(`Video generated successfully for journey ${payload.journeyId}: ${response.data.videoUrl}`);
        return response.data;
      } catch (error) {
        this.logger.error(`AI video generation failed for journey ${payload.journeyId}: ${error.message}`, error.stack);
        throw error;
      }
    }

    // Fallback: simulate video generation and return placeholder video
    this.logger.warn('AI_VIDEO_SERVICE_URL not configured. Using placeholder video URL.');
    const placeholderUrl =
      process.env.DEFAULT_VIDEO_PLACEHOLDER_URL ||
      'https://storage.googleapis.com/wayfinder-static/sample-journey-video.mp4';

    // Simulate some processing latency (reduced from 5s to 2s for faster response)
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { videoUrl: placeholderUrl };
  }
}

