import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiTravelVideoService } from './ai-travel-video.service';
import { ImgBBService } from '../journey/imgbb.service';

/**
 * DTO for video generation request
 */
class GenerateVideoDto {
  prompt: string;
}

/**
 * DTO for video generation with images and music
 */
class GenerateVideoWithMediaDto {
  prompt: string;
  images?: string[];
  musicTrackId?: string;
}

/**
 * DTO for travel plan suggestions query
 */
class TravelPlanQueryDto {
  tripType?: string;
  duration?: string;
  budget?: string;
}

/**
 * AI Travel Video Controller
 * Handles text-to-video generation for travel content
 */
@Controller('ai-video')
export class AiTravelVideoController {
  constructor(
    private readonly aiTravelVideoService: AiTravelVideoService,
    private readonly imgbbService: ImgBBService,
  ) {}

  /**
   * Check if AI video generation is available
   * @returns availability status and suggestions
   */
  @Get('status')
  getStatus() {
    return {
      available: this.aiTravelVideoService.isConfigured(),
      suggestions: this.aiTravelVideoService.getSuggestions(),
      message: this.aiTravelVideoService.isConfigured()
        ? 'AI travel video generation is available'
        : 'AI video generation requires REPLICATE_API_TOKEN to be configured',
    };
  }

  /**
   * Get prompt suggestions for travel videos
   * @returns list of example prompts
   */
  @Get('suggestions')
  getSuggestions() {
    return {
      suggestions: this.aiTravelVideoService.getSuggestions(),
    };
  }

  /**
   * Generate a travel video from a text prompt
   * @body prompt - The text description of the travel scene
   * @returns prediction ID and status
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generateVideo(@Req() req: any, @Body() body: GenerateVideoDto) {
    const userId = req.user.sub;

    if (!body.prompt || typeof body.prompt !== 'string') {
      throw new BadRequestException('Prompt is required');
    }

    const result = await this.aiTravelVideoService.generateVideo(
      userId,
      body.prompt,
    );

    return {
      success: true,
      message: 'Video generation started',
      data: {
        predictionId: result.predictionId,
        status: result.status,
        originalPrompt: result.prompt,
        enhancedPrompt: result.enhancedPrompt,
        estimatedTime: '1-3 minutes',
      },
    };
  }

  /**
   * Check the status of a video generation
   * @param predictionId - The Replicate prediction ID
   * @returns current status and video URL if completed
   */
  @UseGuards(JwtAuthGuard)
  @Get('status/:predictionId')
  async checkStatus(@Param('predictionId') predictionId: string) {
    if (!predictionId) {
      throw new BadRequestException('Prediction ID is required');
    }

    const result =
      await this.aiTravelVideoService.checkPredictionStatus(predictionId);

    return {
      success: true,
      data: {
        predictionId,
        status: result.status,
        videoUrl: result.videoUrl,
        progress: result.progress,
        error: result.error,
        isComplete: result.status === 'succeeded',
        isFailed: result.status === 'failed',
      },
    };
  }

  /**
   * Cancel a video generation in progress
   * @param predictionId - The Replicate prediction ID
   */
  @UseGuards(JwtAuthGuard)
  @Post('cancel/:predictionId')
  async cancelGeneration(@Param('predictionId') predictionId: string) {
    if (!predictionId) {
      throw new BadRequestException('Prediction ID is required');
    }

    await this.aiTravelVideoService.cancelPrediction(predictionId);

    return {
      success: true,
      message: 'Video generation cancelled',
    };
  }

  /**
   * Preview how a prompt will be enhanced
   * Useful for debugging and understanding prompt engineering
   */
  @Get('preview-prompt')
  previewPrompt(@Req() req: any) {
    const prompt = req.query.prompt as string;
    if (!prompt) {
      throw new BadRequestException('Prompt query parameter is required');
    }

    const enhanced = this.aiTravelVideoService.enhancePrompt(prompt);

    return {
      original: prompt,
      enhanced,
    };
  }

  /**
   * Get available music tracks for video creation
   * @returns list of music tracks
   */
  @Get('music-tracks')
  getMusicTracks() {
    return {
      success: true,
      tracks: this.aiTravelVideoService.getMusicTracks(),
    };
  }

  /**
   * Get AI-generated travel plan suggestions
   * @returns list of travel plan suggestions with video prompts
   */
  @Get('travel-plans')
  getTravelPlans(@Req() req: any) {
    const query: TravelPlanQueryDto = {
      tripType: req.query.tripType as string,
      duration: req.query.duration as string,
      budget: req.query.budget as string,
    };

    return {
      success: true,
      plans: this.aiTravelVideoService.getTravelPlanSuggestions(query),
    };
  }

  /**
   * Generate a travel video with images and music
   * Allows users to upload their own photos and select background music
   * @body prompt - Text description
   * @body images - Array of image URLs
   * @body musicTrackId - Selected music track ID
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate-with-media')
  async generateVideoWithMedia(@Req() req: any, @Body() body: GenerateVideoWithMediaDto) {
    const userId = req.user.sub;

    if (!body.prompt || typeof body.prompt !== 'string') {
      throw new BadRequestException('Prompt is required');
    }

    const result = await this.aiTravelVideoService.generateVideoWithMedia(
      userId,
      body.prompt,
      body.images || [],
      body.musicTrackId,
    );

    return {
      success: true,
      message: 'Video generation started',
      data: {
        predictionId: result.predictionId,
        status: result.status,
        originalPrompt: result.prompt,
        enhancedPrompt: result.enhancedPrompt,
        musicTrack: result.musicTrack,
        estimatedTime: '1-3 minutes',
      },
    };
  }

  /**
   * Upload a single image from phone to ImgBB
   * Returns the URL that can be used for video generation
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 32 * 1024 * 1024 }, // 32MB max
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
    }

    try {
      // Upload directly from buffer to ImgBB
      const imageUrl = await this.imgbbService.uploadImageFromBuffer(
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      return {
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: imageUrl,
          originalName: file.originalname,
          size: file.size,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload multiple images from phone to ImgBB
   * Returns array of URLs that can be used for video generation
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload-images')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: memoryStorage(),
      limits: { fileSize: 32 * 1024 * 1024 }, // 32MB max per file
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    if (files.length > 20) {
      throw new BadRequestException('Maximum 20 images allowed per upload');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    // Validate all files
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type for ${file.originalname}. Allowed: JPEG, PNG, GIF, WebP`);
      }
    }

    try {
      const uploadedImages: { url: string; originalName: string }[] = [];

      // Upload all images in parallel directly from buffers
      const uploadPromises = files.map(async (file) => {
        const url = await this.imgbbService.uploadImageFromBuffer(
          file.buffer,
          file.originalname,
          file.mimetype,
        );
        return { url, originalName: file.originalname };
      });

      const results = await Promise.all(uploadPromises);
      uploadedImages.push(...results);

      return {
        success: true,
        message: `${uploadedImages.length} images uploaded successfully`,
        data: {
          images: uploadedImages,
          count: uploadedImages.length,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload images: ${error.message}`);
    }
  }
}

