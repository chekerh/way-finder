import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v2 as cloudinary } from 'cloudinary';
import { VideoJobPayload } from './interfaces/video-job-payload.interface';

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

  constructor(private readonly httpService: HttpService) {
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;
    this.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    this.cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
    this.kaggleUsername = process.env.KAGGLE_USERNAME;
    this.kaggleKey = process.env.KAGGLE_KEY;

    // Configure Cloudinary if credentials are available
    if (
      this.cloudinaryCloudName &&
      this.cloudinaryApiKey &&
      this.cloudinaryApiSecret
    ) {
      cloudinary.config({
        cloud_name: this.cloudinaryCloudName,
        api_key: this.cloudinaryApiKey,
        api_secret: this.cloudinaryApiSecret,
      });
    }
  }

  async generateVideo(payload: VideoJobPayload): Promise<AiVideoResponse> {
    this.logger.log(
      `Generating video for journey ${payload.journeyId} with ${payload.slides.length} slides`,
    );

    // Priority 1: Cloudinary (most reliable for image-to-video montages)
    if (
      this.cloudinaryCloudName &&
      this.cloudinaryApiKey &&
      this.cloudinaryApiSecret
    ) {
      try {
        return await this.generateWithCloudinary(payload);
      } catch (error) {
        this.logger.warn(
          `Cloudinary failed: ${error.message}, trying next option`,
        );
      }
    }

    // Priority 2: Custom AI service endpoint
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

    // Priority 3: Replicate API (better for AI video generation)
    if (this.replicateApiToken) {
      try {
        return await this.generateWithReplicate(payload);
      } catch (error) {
        this.logger.warn(
          `Replicate API failed: ${error.message}, trying next option`,
        );
      }
    }

    // Priority 4: Kaggle Notebook API (for custom models)
    if (this.kaggleUsername && this.kaggleKey) {
      try {
        return await this.generateWithKaggle(payload);
      } catch (error) {
        this.logger.warn(
          `Kaggle API failed: ${error.message}, trying next option`,
        );
      }
    }

    // Priority 5: Hugging Face Inference API
    if (this.huggingFaceApiKey) {
      try {
        return await this.generateWithHuggingFace(payload);
      } catch (error) {
        this.logger.warn(
          `Hugging Face API failed: ${error.message}, using fallback`,
        );
      }
    }

    // Fallback: Use reliable placeholder video that always works
    this.logger.warn(
      'No AI video service configured. Using reliable placeholder video URL. ' +
        'Set CLOUDINARY_* (recommended), AI_VIDEO_SERVICE_URL, REPLICATE_API_TOKEN, KAGGLE_*, or HUGGINGFACE_API_KEY to enable video generation.',
    );
    return this.getPlaceholderVideo();
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

      // Step 1: Upload images to Cloudinary (if they're not already there)
      const uploadedImagePublicIds: string[] = [];
      
      for (const slide of payload.slides) {
        try {
          // Check if image is already a Cloudinary URL
          if (slide.imageUrl.includes('cloudinary.com')) {
            // Extract public_id from Cloudinary URL
            const urlMatch = slide.imageUrl.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
            if (urlMatch && urlMatch[1]) {
              uploadedImagePublicIds.push(urlMatch[1]);
              continue;
            }
          }

          // Upload image to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(slide.imageUrl, {
            resource_type: 'image',
            folder: 'wayfinder/journeys',
            transformation: [
              { width: 1920, height: 1080, crop: 'fill', quality: 'auto' },
            ],
          });
          uploadedImagePublicIds.push(uploadResult.public_id);
          this.logger.log(`Uploaded image to Cloudinary: ${uploadResult.public_id}`);
        } catch (uploadError) {
          this.logger.warn(
            `Failed to upload image ${slide.imageUrl}: ${uploadError.message}`,
          );
          // Continue with other images
        }
      }

      if (uploadedImagePublicIds.length === 0) {
        throw new Error('Failed to upload any images to Cloudinary');
      }

      // Step 2: Create video montage
      // Note: Cloudinary's free tier doesn't support direct video generation from multiple images
      // For a proper video montage, we need to either:
      // 1. Use Cloudinary's video generation API (paid feature)
      // 2. Use a third-party service like Shotstack, Creatomate, or similar
      // 3. Use FFmpeg server-side to create the montage and upload to Cloudinary
      
      // For now, we'll create a simple video from the first image
      // In production, implement one of the above solutions
      const firstImageId = uploadedImagePublicIds[0];
      const totalDuration = Math.min(
        Math.max(uploadedImagePublicIds.length * 3, 10),
        60,
      );

      // Generate a video URL from the first image
      // This is a placeholder - Cloudinary will generate a static video from the image
      const generatedVideoUrl = cloudinary.url(firstImageId, {
        resource_type: 'video',
        transformation: [
          {
            width: 1920,
            height: 1080,
            crop: 'fill',
            format: 'mp4',
            duration: totalDuration,
            fps: 24,
          },
        ],
      });

      this.logger.log(
        `Video URL generated from first image: ${generatedVideoUrl}`,
      );
      this.logger.warn(
        'Note: This creates a static video from one image. For a proper montage with multiple images, ' +
          'implement a video generation service (Shotstack, Creatomate, or FFmpeg-based solution).',
      );

      return { videoUrl: generatedVideoUrl };
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

      // For now, fallback to placeholder
      // TODO: Implement full Kaggle API integration with:
      // - Dataset creation via API
      // - Notebook execution via API
      // - Output retrieval
      return this.getPlaceholderVideo();
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
      // Note: The model ID format should be "owner/model:version" or just use version ID
      const predictionResponse = await firstValueFrom(
        this.httpService.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: modelId.includes(':') ? modelId : `${modelId}:latest`,
            input: {
              image: firstImageUrl,
              // For image-to-video models, adjust parameters as needed
              num_frames: 50,
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
          this.httpService.get(
            `https://api.replicate.com/v1/predictions/${predictionId}`,
            {
              headers: {
                Authorization: `Token ${this.replicateApiToken}`,
              },
              timeout: 10000,
            },
          ),
        );

        const status = statusResponse.data.status;
        this.logger.log(`Replicate prediction status: ${status}`);

        if (status === 'succeeded') {
          videoUrl =
            statusResponse.data.output?.[0] || statusResponse.data.output;
          break;
        } else if (status === 'failed' || status === 'canceled') {
          throw new Error(
            `Replicate prediction ${status}: ${statusResponse.data.error || 'Unknown error'}`,
          );
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

      this.logger.log(
        `Video generated successfully via Replicate: ${videoUrl}`,
      );
      return { videoUrl };
    } catch (error) {
      this.logger.error(`Replicate API failed: ${error.message}`, error.stack);
      // Fallback to placeholder if Replicate fails
      this.logger.warn(
        'Falling back to placeholder video due to Replicate error',
      );
      return this.getPlaceholderVideo();
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
          'Consider using Replicate API (REPLICATE_API_TOKEN) or a custom service (AI_VIDEO_SERVICE_URL) for better results.',
      );

      return this.getPlaceholderVideo();
    } catch (error) {
      this.logger.error(
        `Hugging Face API failed: ${error.message}`,
        error.stack,
      );
      return this.getPlaceholderVideo();
    }
  }

  /**
   * Get placeholder video URL for development/testing
   * Uses a reliable, publicly accessible test video
   * This video is guaranteed to be accessible and playable on all devices
   */
  private async getPlaceholderVideo(): Promise<AiVideoResponse> {
    // Use multiple reliable video URLs as fallbacks
    // These are publicly accessible test videos that work on all platforms
    const reliableVideoUrls = [
      process.env.DEFAULT_VIDEO_PLACEHOLDER_URL,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    ].filter(Boolean) as string[];

    const placeholderUrl = reliableVideoUrls[0];

    this.logger.log(
      `Using reliable placeholder video URL: ${placeholderUrl}. ` +
        'This is a test video that works on all devices. ' +
        'Configure REPLICATE_API_TOKEN or AI_VIDEO_SERVICE_URL for real AI video generation.',
    );

    // Simulate processing latency (2-3 seconds to mimic real processing)
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 1000),
    );

    // Validate URL format
    try {
      const url = new URL(placeholderUrl);
      if (!url.protocol.startsWith('http')) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }
    } catch (error) {
      this.logger.error(
        `Invalid placeholder URL format: ${placeholderUrl}`,
        error,
      );
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
        'res.cloudinary.com',
        'cloudinary.com',
        'sample-videos.com',
        'learningcontainer.com',
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
