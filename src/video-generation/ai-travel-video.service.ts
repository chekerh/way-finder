import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Types } from 'mongoose';
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
  images?: string[];
  musicTrack?: string;
}

/**
 * Music track options for video generation
 */
export interface MusicTrack {
  id: string;
  name: string;
  genre: string;
  duration: string;
  previewUrl?: string;
}

/**
 * AI Travel Plan suggestion
 */
export interface TravelPlanSuggestion {
  id: string;
  title: string;
  description: string;
  destinations: string[];
  duration: string;
  activities: string[];
  videoPrompt: string;
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
    'beach',
    'mountain',
    'city',
    'sunset',
    'sunrise',
    'ocean',
    'forest',
    'desert',
    'island',
    'temple',
    'castle',
    'village',
    'countryside',
    'lake',
    'river',
    'waterfall',
    'canyon',
    'safari',
    'cruise',
    'paris',
    'tokyo',
    'rome',
    'dubai',
    'bali',
    'new york',
    'london',
    'maldives',
    'santorini',
    'venice',
    'barcelona',
    'amsterdam',
    'hiking',
    'camping',
    'adventure',
    'explore',
    'journey',
    'trip',
    'vacation',
    'holiday',
    'travel',
    'destination',
    'wanderlust',
  ];

  constructor(private readonly httpService: HttpService) {
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;

    if (this.replicateApiToken) {
      this.logger.log(
        '✅ Replicate API configured for AI travel video generation',
      );
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

  /**
   * Get available music tracks for video creation
   */
  getMusicTracks(): MusicTrack[] {
    return [
      {
        id: 'ambient-travel',
        name: 'Wanderlust Dreams',
        genre: 'Ambient',
        duration: '3:30',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      },
      {
        id: 'upbeat-adventure',
        name: 'Adventure Awaits',
        genre: 'Upbeat',
        duration: '2:45',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_4a26f8b6e9.mp3',
      },
      {
        id: 'cinematic-epic',
        name: 'Epic Journey',
        genre: 'Cinematic',
        duration: '4:00',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe5c21c.mp3',
      },
      {
        id: 'tropical-vibes',
        name: 'Tropical Paradise',
        genre: 'Tropical',
        duration: '3:15',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c2eb9082c2.mp3',
      },
      {
        id: 'romantic-piano',
        name: 'Romantic Sunset',
        genre: 'Piano',
        duration: '3:45',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3',
      },
      {
        id: 'nature-sounds',
        name: 'Nature Harmony',
        genre: 'Nature',
        duration: '5:00',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_a3a7c7e7e6.mp3',
      },
      {
        id: 'electronic-chill',
        name: 'Chill Explorer',
        genre: 'Electronic',
        duration: '3:20',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2021/11/23/audio_0d0de4a196.mp3',
      },
      {
        id: 'world-music',
        name: 'World Cultures',
        genre: 'World',
        duration: '4:15',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_1e0e391d22.mp3',
      },
    ];
  }

  /**
   * Get AI-generated travel plan suggestions based on user preferences
   */
  getTravelPlanSuggestions(preferences?: {
    tripType?: string;
    duration?: string;
    budget?: string;
  }): TravelPlanSuggestion[] {
    const plans: TravelPlanSuggestion[] = [
      {
        id: 'romantic-paris',
        title: 'Romantic Week in Paris',
        description:
          'Experience the city of love with wine, art, and breathtaking views',
        destinations: ['Paris', 'Versailles', 'Giverny'],
        duration: '7 days',
        activities: [
          'Eiffel Tower sunset',
          'Louvre Museum',
          'Seine River cruise',
          'Montmartre walk',
        ],
        videoPrompt:
          'Romantic couple walking through Paris streets at sunset, Eiffel Tower glowing, Seine River cruise under lights, French cafes and wine',
      },
      {
        id: 'adventure-bali',
        title: 'Bali Adventure Escape',
        description: 'Temples, rice terraces, and tropical beaches await',
        destinations: ['Ubud', 'Seminyak', 'Uluwatu', 'Nusa Penida'],
        duration: '10 days',
        activities: [
          'Temple hopping',
          'Rice terrace trekking',
          'Surfing',
          'Snorkeling',
          'Spa day',
        ],
        videoPrompt:
          'Drone over Bali rice terraces at sunrise, ancient temples with incense, crystal blue waters of Nusa Penida, tropical jungle waterfalls',
      },
      {
        id: 'safari-africa',
        title: 'African Safari Adventure',
        description: 'Witness the Big Five in their natural habitat',
        destinations: ['Serengeti', 'Ngorongoro', 'Masai Mara'],
        duration: '12 days',
        activities: [
          'Game drives',
          'Hot air balloon',
          'Masai village visit',
          'Sunset sundowners',
        ],
        videoPrompt:
          'African safari lions at golden hour, elephants crossing savanna, hot air balloon over Serengeti, spectacular African sunset',
      },
      {
        id: 'japan-culture',
        title: 'Japan Cultural Immersion',
        description: 'Ancient traditions meet modern marvels',
        destinations: ['Tokyo', 'Kyoto', 'Osaka', 'Hakone'],
        duration: '14 days',
        activities: [
          'Temple visits',
          'Tea ceremony',
          'Cherry blossom viewing',
          'Mount Fuji',
        ],
        videoPrompt:
          'Cherry blossoms falling in Japanese garden, ancient Kyoto temples, Mount Fuji at sunrise, Tokyo neon lights at night',
      },
      {
        id: 'iceland-nature',
        title: 'Iceland Nature Wonders',
        description: 'Fire and ice landscapes like nowhere else',
        destinations: [
          'Reykjavik',
          'Golden Circle',
          'South Coast',
          'Snæfellsnes',
        ],
        duration: '8 days',
        activities: [
          'Northern lights',
          'Glacier hiking',
          'Hot springs',
          'Whale watching',
        ],
        videoPrompt:
          'Northern lights dancing over Iceland glacier, dramatic waterfall with rainbow, geothermal hot springs steam, black sand beaches',
      },
      {
        id: 'maldives-relaxation',
        title: 'Maldives Luxury Retreat',
        description: 'Crystal clear waters and overwater bungalows',
        destinations: ['Malé', 'Private Island Resort'],
        duration: '7 days',
        activities: [
          'Snorkeling',
          'Spa treatments',
          'Sunset dolphin cruise',
          'Underwater dining',
        ],
        videoPrompt:
          'Crystal clear turquoise Maldives water, overwater bungalow at sunset, tropical fish swimming, romantic beach dinner under stars',
      },
    ];

    // Filter based on preferences if provided
    if (preferences?.tripType) {
      const tripType = preferences.tripType.toLowerCase();
      if (tripType === 'romantic') {
        return plans.filter(
          (p) => p.id.includes('romantic') || p.id.includes('maldives'),
        );
      }
      if (tripType === 'adventure') {
        return plans.filter(
          (p) => p.id.includes('adventure') || p.id.includes('iceland'),
        );
      }
      if (tripType === 'cultural') {
        return plans.filter(
          (p) => p.id.includes('culture') || p.id.includes('paris'),
        );
      }
      if (tripType === 'relaxation') {
        return plans.filter(
          (p) => p.id.includes('maldives') || p.id.includes('bali'),
        );
      }
    }

    return plans;
  }

  /**
   * Generate video with images and music (montage style)
   * Uses uploaded images to create a travel montage video
   */
  async generateVideoWithMedia(
    userId: string,
    prompt: string,
    images: string[],
    musicTrackId?: string,
  ): Promise<{
    predictionId: string;
    status: string;
    prompt: string;
    enhancedPrompt: string;
    musicTrack?: MusicTrack;
  }> {
    if (!this.replicateApiToken) {
      throw new BadRequestException(
        'AI video generation is not configured. Please set REPLICATE_API_TOKEN.',
      );
    }

    // Validate images
    if (images && images.length > 0) {
      if (images.length > 20) {
        throw new BadRequestException('Maximum 20 images allowed per video.');
      }

      // Validate image URLs
      for (const img of images) {
        if (!img.startsWith('http://') && !img.startsWith('https://')) {
          throw new BadRequestException('Invalid image URL format.');
        }
      }
    }

    // If no prompt or too short but we have images, build a default prompt
    let finalPrompt = (prompt || '').trim();
    if (!finalPrompt || finalPrompt.length < 5) {
      if (images && images.length > 0) {
        finalPrompt = `Travel memories video created from ${images.length} personal photos.`;
      } else {
        throw new BadRequestException(
          'Prompt must be at least 5 characters long, or provide at least one image.',
        );
      }
    }

    // Get music track if specified
    const musicTrack = musicTrackId
      ? this.getMusicTracks().find((t) => t.id === musicTrackId)
      : undefined;

    // Enhance prompt with image and music context
    let enhancedPrompt = this.enhancePrompt(finalPrompt);
    if (images && images.length > 0) {
      enhancedPrompt += ` Using ${images.length} travel photos as reference.`;
    }
    if (musicTrack) {
      enhancedPrompt += ` Music style: ${musicTrack.genre.toLowerCase()}, ${musicTrack.name.toLowerCase()} mood.`;
    }

    // For image-based videos, we'll use Stable Video Diffusion with the first image
    if (images && images.length > 0) {
      try {
        // Use img2vid model for image-to-video generation
        const response = await firstValueFrom(
          this.httpService.post(
            `${this.replicateApiUrl}/predictions`,
            {
              version:
                'dc6b8e5e60a8738aa0dd71e62b80b1aba1c72ab6a9d4e595e73d05ef7b0e01f3', // img2vid-xt
              input: {
                image: images[0],
                motion_bucket_id: 127,
                fps: 8,
                cond_aug: 0.02,
                decoding_t: 14,
                video_length: 25,
              },
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
          `✅ Image-to-video generation started with prediction ID: ${prediction.id}`,
        );

        return {
          predictionId: prediction.id,
          status: prediction.status,
          prompt: finalPrompt,
          enhancedPrompt,
          musicTrack,
        };
      } catch (error: any) {
        this.logger.warn(
          `Image-to-video failed: ${error.message}, falling back to text-to-video`,
        );
        // Fall back to regular text-to-video
      }
    }

    // Fall back to regular text-to-video generation (prompt-only mode)
    const result = await this.generateVideo(userId, finalPrompt);
    return {
      ...result,
      musicTrack,
    };
  }
}
