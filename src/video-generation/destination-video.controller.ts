import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DestinationVideoService } from './destination-video.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class DestinationVideoController {
  constructor(private readonly destinationVideoService: DestinationVideoService) {}

  /**
   * Generate video for a specific destination
   * POST /api/users/:userId/destinations/:destination/generate-video
   */
  @Post(':userId/destinations/:destination/generate-video')
  async generateVideo(
    @Param('userId') userId: string,
    @Param('destination') destination: string,
    @Req() req: any,
  ) {
    // Verify that the authenticated user matches userId
    if (req.user.sub !== userId) {
      throw new BadRequestException('You can only generate videos for your own account');
    }

    if (!destination || destination.trim().length === 0) {
      throw new BadRequestException('Destination is required');
    }

    const destinationVideo = await this.destinationVideoService.generateVideo(
      userId,
      destination.trim(),
    );

    return {
      status: destinationVideo.status,
      userId: destinationVideo.user_id.toString(),
      destination: destinationVideo.destination,
      imageCount: destinationVideo.image_count,
      message:
        destinationVideo.status === 'processing'
          ? 'Video generation started'
          : destinationVideo.status === 'ready'
            ? 'Video already exists'
            : 'Video generation queued',
    };
  }

  /**
   * Get video status for a destination
   * GET /api/users/:userId/destinations/:destination/video-status
   */
  @Get(':userId/destinations/:destination/video-status')
  async getVideoStatus(
    @Param('userId') userId: string,
    @Param('destination') destination: string,
    @Req() req: any,
  ) {
    // Allow users to check their own videos or public videos
    const destinationVideo = await this.destinationVideoService.getVideoStatus(
      userId,
      destination.trim(),
    );

    if (!destinationVideo) {
      return {
        status: 'not_started',
        videoUrl: null,
        message: 'No video found for this destination',
      };
    }

    return {
      status: destinationVideo.status,
      videoUrl: destinationVideo.video_url || null,
      imageCount: destinationVideo.image_count,
      generatedAt: destinationVideo.generated_at || null,
      errorMessage: destinationVideo.error_message || null,
    };
  }

  /**
   * Get all destinations with video status for a user
   * GET /api/users/:userId/destinations
   */
  @Get(':userId/destinations')
  async getUserDestinations(
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    // Allow users to check their own destinations
    if (req.user.sub !== userId) {
      throw new BadRequestException('You can only view your own destinations');
    }

    const destinations = await this.destinationVideoService.getUserDestinationsWithVideoStatus(
      userId,
    );

    return {
      destinations,
    };
  }

  /**
   * Get all destination videos for a user
   * GET /api/users/:userId/destination-videos
   */
  @Get(':userId/destination-videos')
  async getUserDestinationVideos(
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    // Allow users to view their own videos
    if (req.user.sub !== userId) {
      throw new BadRequestException('You can only view your own videos');
    }

    const videos = await this.destinationVideoService.getUserDestinationVideos(userId);

    return {
      videos: videos.map((v) => ({
        destination: v.destination,
        status: v.status,
        videoUrl: v.video_url,
        imageCount: v.image_count,
        generatedAt: v.generated_at,
      })),
    };
  }
}

