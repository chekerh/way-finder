import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { VideoJobPayload } from './interfaces/video-job-payload.interface';

interface AiVideoResponse {
  videoUrl: string;
}

/**
 * AI Video Service for generating travel montage videos from images
 * Supports multiple AI providers:
 * 1. Custom AI service via AI_VIDEO_SERVICE_URL
 * 2. Hugging Face Inference API (if HUGGINGFACE_API_KEY is set)
 * 3. Replicate API (if REPLICATE_API_TOKEN is set)
 * 4. Fallback placeholder for development
 */
@Injectable()
export class AiVideoService {
  private readonly logger = new Logger(AiVideoService.name);
  private readonly huggingFaceApiKey: string | undefined;
  private readonly replicateApiToken: string | undefined;

  constructor(private readonly httpService: HttpService) {
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;
  }

  async generateVideo(payload: VideoJobPayload): Promise<AiVideoResponse> {
    this.logger.log(`Generating video for journey ${payload.journeyId} with ${payload.slides.length} slides`);

    // Priority 1: Custom AI service endpoint
    const customEndpoint = process.env.AI_VIDEO_SERVICE_URL;
    if (customEndpoint) {
      return this.generateWithCustomService(customEndpoint, payload);
    }

    // Priority 2: Replicate API (better for video generation)
    if (this.replicateApiToken) {
      return this.generateWithReplicate(payload);
    }

    // Priority 3: Hugging Face Inference API
    if (this.huggingFaceApiKey) {
      return this.generateWithHuggingFace(payload);
    }

    // Fallback: placeholder for development
    this.logger.warn(
      'No AI video service configured. Using placeholder video URL. ' +
      'Set AI_VIDEO_SERVICE_URL, REPLICATE_API_TOKEN, or HUGGINGFACE_API_KEY to enable video generation.',
    );
    return this.getPlaceholderVideo();
  }

  /**
   * Generate video using custom AI service endpoint
   */
  private async generateWithCustomService(
    endpoint: string,
    payload: VideoJobPayload,
  ): Promise<AiVideoResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<AiVideoResponse>(
          endpoint,
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

      this.logger.log(`Video generated successfully via custom service: ${response.data.videoUrl}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Custom AI service failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate video using Replicate API
   * Replicate has excellent video generation models
   */
  private async generateWithReplicate(payload: VideoJobPayload): Promise<AiVideoResponse> {
    try {
      // Replicate API endpoint for video generation
      // Using a video montage model (you can change the model ID)
      const modelId = process.env.REPLICATE_VIDEO_MODEL || 'anotherjesse/zeroscope-v2-xl';
      
      this.logger.log(`Generating video with Replicate model: ${modelId}`);

      // For image-to-video, we'll use a montage approach
      // First, create a prediction
      const predictionResponse = await firstValueFrom(
        this.httpService.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: modelId,
            input: {
              images: payload.slides.map((slide) => slide.imageUrl),
              destination: payload.destination || 'Travel Destination',
              duration: 30, // 30 seconds
              fps: 24,
            },
          },
          {
            headers: {
              Authorization: `Token ${this.replicateApiToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 seconds for initial request
          },
        ),
      );

      const predictionId = predictionResponse.data.id;
      this.logger.log(`Replicate prediction created: ${predictionId}`);

      // Poll for completion (Replicate predictions are async)
      let videoUrl: string | null = null;
      const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
      let attempts = 0;

      while (attempts < maxAttempts && !videoUrl) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await firstValueFrom(
          this.httpService.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
              Authorization: `Token ${this.replicateApiToken}`,
            },
            timeout: 10000,
          }),
        );

        const status = statusResponse.data.status;
        this.logger.log(`Replicate prediction status: ${status}`);

        if (status === 'succeeded') {
          videoUrl = statusResponse.data.output?.[0] || statusResponse.data.output;
          break;
        } else if (status === 'failed' || status === 'canceled') {
          throw new Error(`Replicate prediction ${status}: ${statusResponse.data.error || 'Unknown error'}`);
        }

        attempts++;
      }

      if (!videoUrl) {
        throw new Error('Replicate prediction timed out after 5 minutes');
      }

      this.logger.log(`Video generated successfully via Replicate: ${videoUrl}`);
      return { videoUrl };
    } catch (error) {
      this.logger.error(`Replicate API failed: ${error.message}`, error.stack);
      // Fallback to placeholder if Replicate fails
      this.logger.warn('Falling back to placeholder video due to Replicate error');
      return this.getPlaceholderVideo();
    }
  }

  /**
   * Generate video using Hugging Face Inference API
   * Note: HF may have limited video generation models, this is a placeholder
   */
  private async generateWithHuggingFace(payload: VideoJobPayload): Promise<AiVideoResponse> {
    try {
      // Hugging Face doesn't have direct video generation from images
      // This would require a custom model or service
      // For now, we'll use a placeholder approach
      this.logger.warn(
        'Hugging Face video generation not fully implemented. ' +
        'Consider using Replicate API or a custom service for better results.',
      );
      
      // You could implement a Hugging Face Space that does video generation
      // For now, fallback to placeholder
      return this.getPlaceholderVideo();
    } catch (error) {
      this.logger.error(`Hugging Face API failed: ${error.message}`, error.stack);
      return this.getPlaceholderVideo();
    }
  }

  /**
   * Get placeholder video URL for development/testing
   */
  private async getPlaceholderVideo(): Promise<AiVideoResponse> {
    const placeholderUrl =
      process.env.DEFAULT_VIDEO_PLACEHOLDER_URL ||
      'https://storage.googleapis.com/wayfinder-static/sample-journey-video.mp4';

    // Simulate processing latency
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return { videoUrl: placeholderUrl };
  }
}

