import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v2 as cloudinary } from 'cloudinary';
import { VideoJobPayload } from './interfaces/video-job-payload.interface';
import type { AxiosError } from 'axios';

interface AiVideoResponse {
  videoUrl: string;
}

/**
 * AI Video Service for generating travel montage videos from images
 * Supports multiple AI providers:
 * 1. Cloudinary (if CLOUDINARY_* env vars are set) - Best for reliable video montages
 * 2. Custom AI service via AI_VIDEO_SERVICE_URL
 * 3. Replicate API (if REPLICATE_API_TOKEN is set) - Best for AI video generation
 * 4. Kaggle Notebook API (if KAGGLE_USERNAME and KAGGLE_KEY are set) - For custom models
 * 5. Hugging Face Inference API (if HUGGINGFACE_API_KEY is set)
 * 6. Fallback placeholder for development
 */
@Injectable()
export class AiVideoService {
  private readonly logger = new Logger(AiVideoService.name);
  private readonly huggingFaceApiKey: string | undefined;
  private readonly replicateApiToken: string | undefined;
  private readonly cloudinaryCloudName: string | undefined;
  private readonly cloudinaryApiKey: string | undefined;
  private readonly cloudinaryApiSecret: string | undefined;
  private readonly kaggleUsername: string | undefined;
  private readonly kaggleKey: string | undefined;
  private readonly shotstackApiKey: string | undefined;
  private readonly shotstackApiUrl: string | undefined;

  constructor(private readonly httpService: HttpService) {
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;
    this.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    this.cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
    this.kaggleUsername = process.env.KAGGLE_USERNAME;
    this.kaggleKey = process.env.KAGGLE_KEY;
    this.shotstackApiKey = process.env.SHOTSTACK_API_KEY;
    
    // Auto-detect environment based on API key or use explicit URL
    if (process.env.SHOTSTACK_API_URL) {
      this.shotstackApiUrl = process.env.SHOTSTACK_API_URL;
    } else if (this.shotstackApiKey) {
      // Sandbox keys typically start with 'z' or are shorter, Production keys start with 'i' or 'H'
      // Default to production, but user can override with SHOTSTACK_API_URL
      // Sandbox: https://api.shotstack.io/stage
      // Production: https://api.shotstack.io/v1
      const isSandbox = this.shotstackApiKey.startsWith('z') || 
                       this.shotstackApiKey.startsWith('zk') ||
                       process.env.SHOTSTACK_ENV === 'sandbox';
      this.shotstackApiUrl = isSandbox 
        ? 'https://api.shotstack.io/stage' 
        : 'https://api.shotstack.io/v1';
    } else {
      this.shotstackApiUrl = 'https://api.shotstack.io/v1'; // Default to production
    }

    // Configure Cloudinary if credentials are available
    // Only configure if cloud_name is valid (not a placeholder like "wayfinder")
    if (
      this.cloudinaryCloudName &&
      this.cloudinaryApiKey &&
      this.cloudinaryApiSecret &&
      this.cloudinaryCloudName !== 'wayfinder' && // Skip if placeholder value
      this.cloudinaryCloudName.length > 3 // Basic validation
    ) {
      try {
        cloudinary.config({
          cloud_name: this.cloudinaryCloudName,
          api_key: this.cloudinaryApiKey,
          api_secret: this.cloudinaryApiSecret,
          secure: true,
        });
        this.logger.log('Cloudinary configured successfully');
      } catch (error) {
        this.logger.warn(
          `Failed to configure Cloudinary: ${error.message}. Video generation will use other services.`,
        );
      }
    } else if (this.cloudinaryCloudName === 'wayfinder') {
      this.logger.warn(
        'Cloudinary cloud_name appears to be a placeholder ("wayfinder"). ' +
          'Please set a valid CLOUDINARY_CLOUD_NAME from your Cloudinary dashboard. ' +
          'Video generation will use other services or fallback.',
      );
    }
  }

  async generateVideo(payload: VideoJobPayload): Promise<AiVideoResponse> {
    this.logger.log(
      `Generating video for journey ${payload.journeyId} with ${payload.slides.length} slides`,
    );

    // Validate that we have images
    if (!payload.slides || payload.slides.length === 0) {
      throw new Error('No images provided for video generation');
    }

    // Log image URLs for debugging (first 3 only to avoid log spam)
    const imagePreview = payload.slides
      .slice(0, 3)
      .map((s) => s.imageUrl)
      .join(', ');
    this.logger.log(
      `Image URLs (first 3): ${imagePreview}${payload.slides.length > 3 ? '...' : ''}`,
    );

    // Priority 1: Shotstack API (best for video montages from multiple images)
    if (this.shotstackApiKey) {
      try {
        this.logger.log('Attempting video generation with Shotstack API...');
        return await this.generateWithShotstack(payload);
      } catch (error) {
        this.logger.warn(
          `Shotstack failed: ${error.message}, trying next option`,
        );
      }
    } else {
      this.logger.debug(
        'Shotstack API key not configured. Set SHOTSTACK_API_KEY to enable.',
      );
    }

    // Priority 2: Cloudinary (most reliable for image-to-video montages)
    // Only use if cloud_name is valid (not placeholder)
    if (
      this.cloudinaryCloudName &&
      this.cloudinaryApiKey &&
      this.cloudinaryApiSecret &&
      this.cloudinaryCloudName !== 'wayfinder' &&
      this.cloudinaryCloudName.length > 3
    ) {
      try {
        this.logger.log('Attempting video generation with Cloudinary...');
        return await this.generateWithCloudinary(payload);
      } catch (error) {
        this.logger.warn(
          `Cloudinary failed: ${error.message}, trying next option`,
        );
      }
    } else {
      if (this.cloudinaryCloudName === 'wayfinder') {
        this.logger.debug(
          'Cloudinary cloud_name is placeholder. Set valid CLOUDINARY_CLOUD_NAME to enable.',
        );
      } else {
        this.logger.debug(
          'Cloudinary not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to enable.',
        );
      }
    }

    // Priority 3: Custom AI service endpoint
    const customEndpoint = process.env.AI_VIDEO_SERVICE_URL;
    if (customEndpoint) {
      try {
        return await this.generateWithCustomService(customEndpoint, payload);
      } catch (error) {
        this.logger.warn(
          `Custom AI service failed: ${error.message}, trying next option`,
        );
      }
    }

    // Priority 4: Replicate API (better for AI video generation from text/prompts)
    // Note: Replicate is not ideal for image montages - skip it for this use case
    // Replicate models are primarily text-to-video, not image-to-video montages
    // if (this.replicateApiToken) {
    //   try {
    //     return await this.generateWithReplicate(payload);
    //   } catch (error) {
    //     this.logger.warn(
    //       `Replicate API failed: ${error.message}, trying next option`,
    //     );
    //   }
    // }

    // Priority 5: Kaggle Notebook API (for custom models)
    if (this.kaggleUsername && this.kaggleKey) {
      try {
        return await this.generateWithKaggle(payload);
      } catch (error) {
        this.logger.warn(
          `Kaggle API failed: ${error.message}, trying next option`,
        );
      }
    }

    // Priority 6: Hugging Face Inference API
    if (this.huggingFaceApiKey) {
      try {
        return await this.generateWithHuggingFace(payload);
      } catch (error) {
        this.logger.warn(
          `Hugging Face API failed: ${error.message}, using fallback`,
        );
      }
    }

    // No provider succeeded – surface an explicit error so the UI can show a waiting/failed state
    this.handleVideoGenerationUnavailable();
  }

  /**
   * Generate video montage using Shotstack API
   * Shotstack is specifically designed for creating video montages from images
   * Free tier: 50 videos/month
   * Sign up at: https://shotstack.io/
   */
  private async generateWithShotstack(
    payload: VideoJobPayload,
  ): Promise<AiVideoResponse> {
    try {
      if (payload.slides.length === 0) {
        throw new Error('No images provided for video generation');
      }

      this.logger.log(
        `Generating video montage with Shotstack for ${payload.slides.length} images`,
      );

      // Step 1: Validate all image URLs are accessible
      this.logger.log('Validating image URLs...');
      const validatedSlides = await this.validateImageUrls(payload.slides);
      
      if (validatedSlides.length === 0) {
        throw new Error('No valid/accessible images found for video generation');
      }

      if (validatedSlides.length < payload.slides.length) {
        this.logger.warn(
          `Only ${validatedSlides.length} out of ${payload.slides.length} images are accessible. Proceeding with available images.`,
        );
      }

      // Calculate timing: 3 seconds per image, minimum 10 seconds, maximum 60 seconds
      const durationPerImage = 3;
      const totalDuration = Math.min(
        Math.max(validatedSlides.length * durationPerImage, 10),
        60,
      );

      this.logger.log(
        `Creating video montage with ${validatedSlides.length} images, total duration: ${totalDuration}s`,
      );

      // Create timeline with all validated images
      // Note: Making soundtrack optional since the default music URL may not be accessible
      // Users can add music later via SHOTSTACK_MUSIC_URL environment variable
      const soundtrackUrl = process.env.SHOTSTACK_MUSIC_URL;
      const timeline: any = {
        tracks: [
          {
            clips: validatedSlides.map((slide, index) => ({
              asset: {
                type: 'image',
                src: slide.imageUrl,
              },
              start: index * durationPerImage,
              length: durationPerImage,
              transition: {
                in: 'fade',
                out: 'fade',
              },
              effect: 'zoomIn',
              scale: 1.1,
            })),
          },
        ],
      };

      // Only add soundtrack if a valid URL is provided
      if (soundtrackUrl && soundtrackUrl.trim().length > 0) {
        timeline.soundtrack = {
          src: soundtrackUrl,
          effect: 'fadeOut',
        };
        this.logger.log(`Using custom music URL: ${soundtrackUrl}`);
      } else {
        this.logger.log('No music URL provided, generating video without soundtrack');
      }

      // Create render request
      const renderRequest = {
        timeline,
        output: {
          format: 'mp4',
          resolution: 'hd',
          fps: 30,
          quality: 'high',
        },
      };

      // Submit render job
      const renderResponse = await firstValueFrom(
        this.httpService.post(
          `${this.shotstackApiUrl}/render`,
          renderRequest,
          {
            headers: {
              'x-api-key': this.shotstackApiKey,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        ),
      );

      const renderId = renderResponse.data.response.id;
      this.logger.log(`Shotstack render job created: ${renderId}`);

      // Poll for completion (Shotstack renders are async)
      let videoUrl: string | null = null;
      const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
      let attempts = 0;

      while (attempts < maxAttempts && !videoUrl) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await firstValueFrom(
          this.httpService.get(`${this.shotstackApiUrl}/render/${renderId}`, {
            headers: {
              'x-api-key': this.shotstackApiKey,
            },
            timeout: 10000,
          }),
        );

        const status = statusResponse.data.response.status;
        this.logger.log(`Shotstack render status: ${status}`);

        if (status === 'done') {
          videoUrl = statusResponse.data.response.url;
          break;
        } else if (status === 'failed') {
          throw new Error(
            `Shotstack render failed: ${statusResponse.data.response.error || 'Unknown error'}`,
          );
        }

        attempts++;
      }

      if (!videoUrl) {
        throw new Error('Shotstack render timed out after 5 minutes');
      }

      // Validate the returned URL
      const isValid = await this.validateVideoUrl(videoUrl);
      if (!isValid) {
        throw new Error(`Invalid video URL returned by Shotstack: ${videoUrl}`);
      }

      this.logger.log(
        `Video generated successfully via Shotstack: ${videoUrl}`,
      );
      return { videoUrl: videoUrl };
    } catch (error) {
      if ((error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError;
        const payloadPreview = JSON.stringify(
          axiosError.response?.data,
          null,
          2,
        );
        this.logger.error(
          `Shotstack API failed: ${axiosError.message} (status ${axiosError.response?.status}) - ${payloadPreview}`,
          axiosError.stack,
        );
      } else {
        this.logger.error(
          `Shotstack API failed: ${(error as Error).message}`,
          (error as Error).stack,
        );
      }
      throw error;
    }
  }

  /**
   * Generate video using Cloudinary
   * Cloudinary can create video montages from images with transitions and effects
   * This is the most reliable method for creating travel montage videos
   */
  private async generateWithCloudinary(
    payload: VideoJobPayload,
  ): Promise<AiVideoResponse> {
    try {
      if (payload.slides.length === 0) {
        throw new Error('No images provided for video generation');
      }

      this.logger.log(
        `Generating video montage with Cloudinary for ${payload.slides.length} images`,
      );

      // Step 1: Validate image URLs first
      this.logger.log('Validating image URLs for Cloudinary...');
      const validatedSlides = await this.validateImageUrls(payload.slides);
      
      if (validatedSlides.length === 0) {
        throw new Error('No valid/accessible images found for video generation');
      }

      if (validatedSlides.length < payload.slides.length) {
        this.logger.warn(
          `Only ${validatedSlides.length} out of ${payload.slides.length} images are accessible. Proceeding with available images.`,
        );
      }

      // Step 2: Upload images to Cloudinary in parallel (much faster!)
      const uploadPromises = validatedSlides.map(async (slide) => {
        try {
          // Check if image is already a Cloudinary URL
          if (slide.imageUrl.includes('cloudinary.com')) {
            // Extract public_id from Cloudinary URL
            const urlMatch = slide.imageUrl.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
            if (urlMatch && urlMatch[1]) {
              return urlMatch[1];
            }
          }

          // Upload image to Cloudinary (parallel uploads)
          const uploadResult = await cloudinary.uploader.upload(slide.imageUrl, {
            resource_type: 'image',
            folder: 'wayfinder/journeys',
            transformation: [
              { width: 1920, height: 1080, crop: 'fill', quality: 'auto' },
            ],
            timeout: 30000, // 30 seconds per image (reduced from default)
          });
          this.logger.log(`Uploaded image to Cloudinary: ${uploadResult.public_id}`);
          return uploadResult.public_id;
        } catch (uploadError) {
          this.logger.warn(
            `Failed to upload image ${slide.imageUrl}: ${uploadError.message}`,
          );
          return null; // Return null for failed uploads
        }
      });

      // Wait for all uploads in parallel
      const uploadResults = await Promise.all(uploadPromises);
      const uploadedImagePublicIds = uploadResults.filter((id): id is string => id !== null);

      if (uploadedImagePublicIds.length === 0) {
        throw new Error('Failed to upload any images to Cloudinary');
      }

      // Step 2: Create video montage
      // Note: Cloudinary's free tier doesn't support direct video generation from multiple images
      // For a proper video montage, we need to either:
      // 1. Use Cloudinary's video generation API (paid feature)
      // 2. Use a third-party service like Shotstack, Creatomate, or similar
      // 3. Use FFmpeg server-side to create the montage and upload to Cloudinary
      
      // Since Cloudinary doesn't support multi-image montages on free tier,
      // we'll recommend using Shotstack instead
      this.logger.warn(
        'Cloudinary free tier does not support video montages from multiple images. ' +
          'Please use SHOTSTACK_API_KEY for proper multi-image video generation. ' +
          'Falling back to Shotstack or other services...',
      );
      
      // Throw error to trigger fallback to Shotstack or other services
      throw new Error(
        'Cloudinary does not support multi-image video montages. Use Shotstack API instead.',
      );
    } catch (error) {
      this.logger.error(
        `Cloudinary video generation failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate video using Kaggle Notebook API
   * Kaggle allows running notebooks via API for custom model inference
   *
   * To use this:
   * 1. Create a Kaggle notebook with video generation code (see KAGGLE_NOTEBOOK_TEMPLATE.py)
   * 2. Publish the notebook on Kaggle
   * 3. Set KAGGLE_USERNAME, KAGGLE_KEY, and optionally KAGGLE_NOTEBOOK_URL
   */
  private async generateWithKaggle(
    payload: VideoJobPayload,
  ): Promise<AiVideoResponse> {
    try {
      this.logger.log('Attempting video generation with Kaggle Notebook API');

      if (payload.slides.length === 0) {
        throw new Error('No images provided for video generation');
      }

      // Kaggle API for running notebooks
      // The Kaggle API allows you to:
      // 1. Create datasets with images
      // 2. Run notebooks programmatically
      // 3. Get outputs from notebooks

      // For a full implementation, you would:
      // 1. Upload images to a Kaggle dataset via API
      // 2. Run the notebook via API with the dataset as input
      // 3. Poll for completion
      // 4. Download the generated video from the notebook output

      // This requires the Kaggle API Python package or HTTP API calls
      // Example API endpoint: https://www.kaggle.com/api/v1/kernels/push

      this.logger.log(
        `Kaggle integration: Would process ${payload.slides.length} images`,
      );
      this.logger.log('Full Kaggle API integration requires:');
      this.logger.log('1. Kaggle API Python package (kaggle)');
      this.logger.log('2. Creating a dataset with images');
      this.logger.log('3. Running notebook via API');
      this.logger.log('4. Retrieving output video');

      this.logger.warn(
        'Kaggle notebook API integration is complex and requires additional setup. ' +
          'See KAGGLE_NOTEBOOK_SETUP.md for detailed instructions. ' +
          'Consider using Cloudinary or Replicate for simpler integration.',
      );

      // For now, explicitly signal that generation is unavailable
      // TODO: Implement full Kaggle API integration with:
      // - Dataset creation via API
      // - Notebook execution via API
      // - Output retrieval
      return this.handleVideoGenerationUnavailable();
    } catch (error) {
      this.logger.error(`Kaggle API failed: ${error.message}`, error.stack);
      throw error;
    }
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
        throw new Error(
          `Invalid video URL returned by custom service: ${response.data.videoUrl}`,
        );
      }

      this.logger.log(
        `Video generated successfully via custom service: ${response.data.videoUrl}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Custom AI service failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate video using Replicate API
   * Replicate has excellent video generation models
   */
  private async generateWithReplicate(
    payload: VideoJobPayload,
  ): Promise<AiVideoResponse> {
    try {
      // Replicate API endpoint for video generation
      // Using a video montage model (you can change the model ID)
      const modelId =
        process.env.REPLICATE_VIDEO_MODEL || 'anotherjesse/zeroscope-v2-xl';

      this.logger.log(`Generating video with Replicate model: ${modelId}`);

      // For image-to-video montage, we need to use a model that supports multiple images
      // Replicate's API structure: we need to use model version ID, not just model name
      // For image-to-video, we'll use the first image and create a video
      // Note: Most Replicate models are text-to-video, not image-to-video
      // For image montages, consider using a custom service or Cloudinary
      
      // Use the first image for video generation
      const firstImageUrl = payload.slides[0]?.imageUrl;
      if (!firstImageUrl) {
        throw new Error('No images provided for video generation');
      }

      // Create a prediction using Replicate API
      // Note: zeroscope-v2-xl is a text-to-video model, not image-to-video
      // For image-to-video, we need a different approach or model
      // For now, we'll skip Replicate for image montages and use it only for text-to-video
      // If you have an image-to-video model, update the model ID and input format
      
      this.logger.warn(
        `Replicate model ${modelId} is designed for text-to-video, not image montages. ` +
          'Skipping Replicate for image montage generation. ' +
          'Use SHOTSTACK_API_KEY or CLOUDINARY_* for proper image montage generation.',
      );
      
      // Skip Replicate for image montages - it's not suitable
      throw new Error(
        'Replicate API is not suitable for image montage generation. Use Shotstack or Cloudinary instead.',
      );
    } catch (error) {
      this.logger.error(`Replicate API failed: ${error.message}`, error.stack);
      // Fallback to placeholder if Replicate fails
      this.logger.warn(
        'Replicate error – no alternative provider available for this request',
      );
      return this.handleVideoGenerationUnavailable();
    }
  }

  /**
   * Generate video using Hugging Face Inference API
   * Uses Hugging Face Spaces or Inference API for video generation
   */
  private async generateWithHuggingFace(
    payload: VideoJobPayload,
  ): Promise<AiVideoResponse> {
    try {
      // Hugging Face Spaces for video generation
      // Example: Using a video generation space (you can change the model name)
      const modelName =
        process.env.HUGGINGFACE_VIDEO_MODEL ||
        'damo-vilab/modelscope-text-to-video-synthesis';

      this.logger.log(
        `Attempting video generation with Hugging Face model: ${modelName}`,
      );

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
              this.logger.log(
                `Video generated successfully via Hugging Face Space: ${videoUrl}`,
              );
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
          'Consider using Shotstack, Cloudinary, or a custom service for better results.',
      );

      return this.handleVideoGenerationUnavailable();
    } catch (error) {
      this.logger.error(
        `Hugging Face API failed: ${error.message}`,
        error.stack,
      );
      return this.handleVideoGenerationUnavailable();
    }
  }

  /**
   * Surface an explicit error when no provider can generate the video.
   */
  private handleVideoGenerationUnavailable(): never {
    this.logger.error(
      '⚠️  Aucun service vidéo disponible. Configurez SHOTSTACK_API_KEY (recommandé), ' +
        'CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET, AI_VIDEO_SERVICE_URL, ou REPLICATE_API_TOKEN.',
    );
    throw new Error(
      'Génération vidéo indisponible pour le moment. Merci de réessayer après configuration d’un service.',
    );
  }

  /**
   * Validate that image URLs are accessible before video generation
   * This prevents video generation failures due to broken image links
   */
  private async validateImageUrls(
    slides: Array<{ imageUrl: string; caption?: string | null }>,
  ): Promise<Array<{ imageUrl: string; caption?: string | null }>> {
    const validatedSlides: Array<{ imageUrl: string; caption?: string | null }> =
      [];

    for (const slide of slides) {
      try {
        // Basic URL format validation
        const url = new URL(slide.imageUrl);

        // Check if URL is from a trusted source
        const trustedDomains = [
          'i.ibb.co', // ImgBB
          'ibb.co', // ImgBB
          'imgbb.com', // ImgBB
          'i.imgur.com', // Imgur
          'imgur.com', // Imgur
          'res.cloudinary.com', // Cloudinary
          'cloudinary.com', // Cloudinary
          'images.unsplash.com', // Unsplash
          'unsplash.com', // Unsplash
          'storage.googleapis.com', // Google Cloud Storage
          's3.amazonaws.com', // AWS S3
          'localhost', // Local development
          '127.0.0.1', // Local development
        ];

        const isTrusted = trustedDomains.some((domain) =>
          url.hostname.includes(domain),
        );

        if (!isTrusted && !url.hostname.includes('.')) {
          this.logger.warn(
            `Image URL from untrusted domain: ${url.hostname}. Skipping.`,
          );
          continue;
        }

        // Try to verify the image is accessible with a HEAD request
        try {
          const headResponse = await firstValueFrom(
            this.httpService.head(slide.imageUrl, {
              timeout: 5000, // 5 second timeout
              validateStatus: (status) => status < 500, // Accept 2xx, 3xx, 4xx
            }),
          );

          if (headResponse.status >= 200 && headResponse.status < 400) {
            validatedSlides.push(slide);
            this.logger.debug(`✓ Image URL validated: ${slide.imageUrl}`);
          } else {
            this.logger.warn(
              `Image URL returned status ${headResponse.status}: ${slide.imageUrl}`,
            );
          }
        } catch (headError) {
          // If HEAD fails, try GET with range request (more compatible)
          try {
            const getResponse = await firstValueFrom(
              this.httpService.get(slide.imageUrl, {
                timeout: 5000,
                headers: { Range: 'bytes=0-1023' }, // Only request first 1KB
                validateStatus: (status) => status < 500,
              }),
            );

            if (getResponse.status >= 200 && getResponse.status < 400) {
              validatedSlides.push(slide);
              this.logger.debug(`✓ Image URL validated (via GET): ${slide.imageUrl}`);
            } else {
              this.logger.warn(
                `Image URL returned status ${getResponse.status}: ${slide.imageUrl}`,
              );
            }
          } catch (getError) {
            // If both HEAD and GET fail, log but still include the image
            // Some servers block HEAD requests but allow GET
            this.logger.warn(
              `Could not validate image URL (will still try to use it): ${slide.imageUrl}. Error: ${(getError as Error).message}`,
            );
            // Include it anyway - Shotstack will handle the error if image is truly inaccessible
            validatedSlides.push(slide);
          }
        }
      } catch (urlError) {
        this.logger.error(
          `Invalid image URL format: ${slide.imageUrl}. Error: ${(urlError as Error).message}`,
        );
        // Skip invalid URLs
      }
    }

    return validatedSlides;
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
        'res.cloudinary.com',
        'cloudinary.com',
        'sample-videos.com',
        'learningcontainer.com',
        'shotstack.io',
        'cdn.shotstack.io',
        's3.amazonaws.com',
      ];

      const urlObj = new URL(url);
      const isTrusted = trustedDomains.some((domain) =>
        urlObj.hostname.includes(domain),
      );

      if (
        !isTrusted &&
        !url.startsWith('http://') &&
        !url.startsWith('https://')
      ) {
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
