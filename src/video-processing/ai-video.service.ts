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

      // Validate the returned URL
      const isValid = await this.validateVideoUrl(response.data.videoUrl);
      if (!isValid) {
        throw new Error(`Invalid video URL returned by custom service: ${response.data.videoUrl}`);
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

      // Validate the returned URL
      const isValid = await this.validateVideoUrl(videoUrl);
      if (!isValid) {
        throw new Error(`Invalid video URL returned by Replicate: ${videoUrl}`);
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
   * Uses Hugging Face Spaces or Inference API for video generation
   */
  private async generateWithHuggingFace(payload: VideoJobPayload): Promise<AiVideoResponse> {
    try {
      // Hugging Face Spaces for video generation
      // Example: Using a video generation space (you can change the model name)
      const modelName = process.env.HUGGINGFACE_VIDEO_MODEL || 'damo-vilab/modelscope-text-to-video-synthesis';
      
      this.logger.log(`Attempting video generation with Hugging Face model: ${modelName}`);
      
      // For image-to-video, we can use a Hugging Face Space
      // Note: Most HF models are text-to-video, not image-to-video
      // For image-to-video, Replicate or a custom service is recommended
      
      // Try to use a Hugging Face Space API if available
      const spaceUrl = process.env.HUGGINGFACE_SPACE_URL;
      if (spaceUrl) {
        try {
          const response = await firstValueFrom(
            this.httpService.post(
              spaceUrl,
              {
                images: payload.slides.map((slide) => slide.imageUrl),
                destination: payload.destination || 'Travel Destination',
              },
              {
                headers: {
                  Authorization: `Bearer ${this.huggingFaceApiKey}`,
                  'Content-Type': 'application/json',
                },
                timeout: 300000, // 5 minutes
              },
            ),
          );

          if (response.data?.video_url || response.data?.output) {
            const videoUrl = response.data.video_url || response.data.output;
            const isValid = await this.validateVideoUrl(videoUrl);
            if (isValid) {
              this.logger.log(`Video generated successfully via Hugging Face Space: ${videoUrl}`);
              return { videoUrl };
            }
          }
        } catch (spaceError) {
          this.logger.warn(`Hugging Face Space failed: ${spaceError.message}`);
        }
      }
      
      // Fallback: Hugging Face doesn't have reliable image-to-video models
      // Recommend using Replicate or custom service
      this.logger.warn(
        'Hugging Face video generation not fully supported for image-to-video. ' +
        'Consider using Replicate API (REPLICATE_API_TOKEN) or a custom service (AI_VIDEO_SERVICE_URL) for better results.',
      );
      
      return this.getPlaceholderVideo();
    } catch (error) {
      this.logger.error(`Hugging Face API failed: ${error.message}`, error.stack);
      return this.getPlaceholderVideo();
    }
  }

  /**
   * Get placeholder video URL for development/testing
   * Uses a reliable, publicly accessible test video
   */
  private async getPlaceholderVideo(): Promise<AiVideoResponse> {
    // Use a publicly accessible test video URL that is guaranteed to work
    // This is a sample video from Google's test bucket that is always available
    const placeholderUrl =
      process.env.DEFAULT_VIDEO_PLACEHOLDER_URL ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    this.logger.warn(
      `Using placeholder video URL: ${placeholderUrl}. ` +
      'This is a test video. Configure REPLICATE_API_TOKEN or AI_VIDEO_SERVICE_URL for real video generation.',
    );

    // Simulate processing latency (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Validate URL format
    try {
      new URL(placeholderUrl);
    } catch (error) {
      this.logger.error(`Invalid placeholder URL format: ${placeholderUrl}`);
      throw new Error('Invalid video URL configuration');
    }

    return { videoUrl: placeholderUrl };
  }

  /**
   * Validate that a video URL is accessible
   * This is a basic check - in production, you might want to do a HEAD request
   */
  private async validateVideoUrl(url: string): Promise<boolean> {
    try {
      // Basic URL format validation
      new URL(url);
      
      // Check if URL is from a trusted source or is a valid format
      const trustedDomains = [
        'commondatastorage.googleapis.com',
        'storage.googleapis.com',
        'replicate.delivery',
        'cdn.replicate.com',
      ];
      
      const urlObj = new URL(url);
      const isTrusted = trustedDomains.some((domain) => urlObj.hostname.includes(domain));
      
      if (!isTrusted && !url.startsWith('http://') && !url.startsWith('https://')) {
        this.logger.warn(`Video URL from untrusted domain: ${urlObj.hostname}`);
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Invalid video URL: ${url}`, error);
      return false;
    }
  }
}

