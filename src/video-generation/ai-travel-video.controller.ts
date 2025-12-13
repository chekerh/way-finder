import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiTravelVideoService } from './ai-travel-video.service';

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
  constructor(private readonly aiTravelVideoService: AiTravelVideoService) {}

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
}

