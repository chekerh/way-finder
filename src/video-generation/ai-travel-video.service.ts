import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';

/**
 * Generated Video Document Schema
 */
export interface GeneratedVideo {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  prompt: string;
  enhancedPrompt: string;
  videoUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider: string;
  predictionId?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * AI Travel Video Service
 * Generates travel-themed videos from text prompts using AI models
 * 
 * Uses Replicate API with specialized travel video generation models
 * Enhances user prompts with travel-specific context for better results
 */
@Injectable()
export class AiTravelVideoService {
  private readonly logger = new Logger(AiTravelVideoService.name);
  private readonly replicateApiToken: string | undefined;
  private readonly replicateApiUrl = 'https://api.replicate.com/v1';

  // Travel-themed video models on Replicate (in order of preference)
  private readonly videoModels = [
    // Stable Video Diffusion - best quality
    'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    // AnimateDiff - good for stylized travel scenes
    'lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48c9f',
    // Zeroscope V2 XL - reliable text-to-video
    'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
  ];

  // Travel-specific prompt enhancement templates
  private readonly travelEnhancements = {
    cinematic: [
      'cinematic drone footage',
      'golden hour lighting',
      'professional travel documentary style',
      '4K quality',
      'smooth camera movement',
      'breathtaking scenery',
    ],
    atmosphere: [
      'vibrant colors',
      'natural lighting',
      'peaceful atmosphere',
      'wanderlust aesthetic',
      'adventure vibes',
    ],
    quality: [
      'high definition',
      'sharp details',
      'professional cinematography',
      'smooth motion',
      'vivid colors',
    ],
  };

  // Travel destination keywords for context detection
  private readonly travelKeywords = [
    'beach', 'mountain', 'city', 'sunset', 'sunrise', 'ocean', 'forest',
    'desert', 'island', 'temple', 'castle', 'village', 'countryside',
    'lake', 'river', 'waterfall', 'canyon', 'safari', 'cruise',
    'paris', 'tokyo', 'rome', 'dubai', 'bali', 'new york', 'london',
    'maldives', 'santorini', 'venice', 'barcelona', 'amsterdam',
    'hiking', 'camping', 'adventure', 'explore', 'journey', 'trip',
    'vacation', 'holiday', 'travel', 'destination', 'wanderlust',
  ];

  constructor(private readonly httpService: HttpService) {
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;

    if (this.replicateApiToken) {
      this.logger.log('✅ Replicate API configured for AI travel video generation');
    } else {
      this.logger.warn(
        '⚠️ REPLICATE_API_TOKEN not set. AI travel video generation will not work.',
      );
    }
  }

  /**
   * Check if the service is configured and available
   */
  isConfigured(): boolean {
    return !!this.replicateApiToken;
  }

  /**
   * Validate that the prompt is travel-related
   */
  private isTravelRelated(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    return this.travelKeywords.some((keyword) =>
      lowerPrompt.includes(keyword.toLowerCase()),
    );
  }

  /**
   * Enhance user prompt with travel-specific context
   * This improves the quality of generated travel videos
   */
  enhancePrompt(userPrompt: string): string {
    // Validate travel context
    if (!this.isTravelRelated(userPrompt)) {
      // Add travel context if not present
      this.logger.debug(
        `Prompt "${userPrompt}" doesn't appear travel-related, adding travel context`,
      );
    }

    // Build enhanced prompt with travel cinematography style
    const cinematicStyle = this.travelEnhancements.cinematic
      .slice(0, 3)
      .join(', ');
    const atmosphere = this.travelEnhancements.atmosphere
      .slice(0, 2)
      .join(', ');
    const quality = this.travelEnhancements.quality.slice(0, 2).join(', ');

    // Create the enhanced prompt
    const enhancedPrompt = `Travel video: ${userPrompt}. Style: ${cinematicStyle}, ${atmosphere}. Quality: ${quality}. No text overlays, no watermarks, smooth continuous motion.`;

    this.logger.debug(`Enhanced prompt: "${enhancedPrompt}"`);
    return enhancedPrompt;
  }

  /**
   * Generate a travel video from a text prompt
   * Uses Replicate API with travel-optimized models
   */
  async generateVideo(
    userId: string,
    prompt: string,
  ): Promise<{
    predictionId: string;
    status: string;
    prompt: string;
    enhancedPrompt: string;
  }> {
    if (!this.replicateApiToken) {
      throw new BadRequestException(
        'AI video generation is not configured. Please set REPLICATE_API_TOKEN.',
      );
    }

    // Validate prompt length
    if (!prompt || prompt.trim().length < 5) {
      throw new BadRequestException(
        'Prompt must be at least 5 characters long.',
      );
    }

    if (prompt.length > 500) {
      throw new BadRequestException('Prompt must be less than 500 characters.');
    }

    // Validate travel context (soft validation - we enhance if not travel-related)
    const isTravelPrompt = this.isTravelRelated(prompt);
    if (!isTravelPrompt) {
      this.logger.warn(
        `Prompt "${prompt}" may not be travel-related. Enhancing with travel context.`,
      );
    }

    // Enhance the prompt with travel-specific context
    const enhancedPrompt = this.enhancePrompt(prompt.trim());

    // Try each model until one works
    let lastError: Error | null = null;

    for (const modelVersion of this.videoModels) {
      try {
        this.logger.log(
          `Attempting video generation with model: ${modelVersion.split(':')[0]}`,
        );

        // Create prediction using Replicate API
        const response = await firstValueFrom(
          this.httpService.post(
            `${this.replicateApiUrl}/predictions`,
            {
              version: modelVersion.split(':')[1],
              input: this.getModelInput(modelVersion, enhancedPrompt),
            },
            {
              headers: {
                Authorization: `Token ${this.replicateApiToken}`,
                'Content-Type': 'application/json',
              },
              timeout: 30000,
            },
          ),
        );

        const prediction = response.data;

        this.logger.log(
          `✅ Video generation started with prediction ID: ${prediction.id}`,
        );

        return {
          predictionId: prediction.id,
          status: prediction.status,
          prompt: prompt.trim(),
          enhancedPrompt,
        };
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `Model ${modelVersion.split(':')[0]} failed: ${error.message}`,
        );
        continue;
      }
    }

    // All models failed
    throw new BadRequestException(
      `Video generation failed: ${lastError?.message || 'Unknown error'}. Please try again later.`,
    );
  }

  /**
   * Get model-specific input parameters
   */
  private getModelInput(
    modelVersion: string,
    prompt: string,
  ): Record<string, any> {
    const modelName = modelVersion.split('/')[0];

    switch (modelName) {
      case 'stability-ai':
        // Stable Video Diffusion uses image input, so we need to use a different approach
        // For text-to-video, we'll use a placeholder image or skip this model
        return {
          prompt,
          num_frames: 25,
          num_inference_steps: 25,
          fps: 8,
        };

      case 'lucataco':
        // AnimateDiff
        return {
          prompt,
          n_prompt:
            'text, watermark, blurry, low quality, static image, no motion',
          steps: 25,
          guidance_scale: 7.5,
          video_length: 16,
          width: 512,
          height: 512,
        };

      case 'anotherjesse':
      default:
        // Zeroscope V2 XL (default)
        return {
          prompt,
          negative_prompt:
            'text, watermark, blurry, low quality, static, boring',
          num_frames: 24,
          num_inference_steps: 50,
          guidance_scale: 12,
          fps: 8,
          width: 576,
          height: 320,
        };
    }
  }

  /**
   * Check the status of a video generation prediction
   */
  async checkPredictionStatus(predictionId: string): Promise<{
    status: string;
    videoUrl?: string;
    error?: string;
    progress?: number;
  }> {
    if (!this.replicateApiToken) {
      throw new BadRequestException('AI video generation is not configured.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.replicateApiUrl}/predictions/${predictionId}`,
          {
            headers: {
              Authorization: `Token ${this.replicateApiToken}`,
            },
            timeout: 10000,
          },
        ),
      );

      const prediction = response.data;

      // Extract video URL from output
      let videoUrl: string | undefined;
      if (prediction.status === 'succeeded' && prediction.output) {
        if (typeof prediction.output === 'string') {
          videoUrl = prediction.output;
        } else if (Array.isArray(prediction.output) && prediction.output[0]) {
          videoUrl = prediction.output[0];
        }
      }

      return {
        status: prediction.status,
        videoUrl,
        error: prediction.error,
        progress: prediction.logs
          ? this.extractProgress(prediction.logs)
          : undefined,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to check prediction status: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to check video status: ${error.message}`,
      );
    }
  }

  /**
   * Extract progress percentage from logs
   */
  private extractProgress(logs: string): number | undefined {
    // Try to find percentage in logs
    const match = logs.match(/(\d+)%/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return undefined;
  }

  /**
   * Cancel a video generation prediction
   */
  async cancelPrediction(predictionId: string): Promise<void> {
    if (!this.replicateApiToken) {
      throw new BadRequestException('AI video generation is not configured.');
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.replicateApiUrl}/predictions/${predictionId}/cancel`,
          {},
          {
            headers: {
              Authorization: `Token ${this.replicateApiToken}`,
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(`Prediction ${predictionId} cancelled`);
    } catch (error: any) {
      this.logger.warn(`Failed to cancel prediction: ${error.message}`);
    }
  }

  /**
   * Get travel video prompt suggestions
   */
  getSuggestions(): string[] {
    return [
      'A serene sunset over the ocean with palm trees swaying',
      'Drone flying over a beautiful mountain landscape',
      'Walking through the streets of Paris at golden hour',
      'A peaceful beach with crystal clear turquoise water',
      'Northern lights dancing over a snowy landscape',
      'Hot air balloons floating over Cappadocia at sunrise',
      'A train journey through the Swiss Alps',
      'Sakura cherry blossoms falling in a Japanese garden',
      'A boat sailing through Venice canals',
      'Safari animals walking across the African savanna',
    ];
  }
}

