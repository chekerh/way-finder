import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VideoGenerationService } from './video-generation.service';
import {
  AiVideoGenerateRequest,
  AiVideoGenerateWithMediaRequest,
} from './dto/video-generation.dto';

@Controller('ai-video')
@UseGuards(JwtAuthGuard)
export class VideoGenerationController {
  constructor(
    private readonly videoGenerationService: VideoGenerationService,
  ) {}

  @Get('status')
  async getAiVideoStatus() {
    return this.videoGenerationService.getAiVideoStatus();
  }

  @Get('suggestions')
  async getAiVideoSuggestions() {
    const suggestions =
      await this.videoGenerationService.getAiVideoSuggestions();
    return { suggestions };
  }

  @Post('generate')
  async generateAiTravelVideo(
    @Body() request: AiVideoGenerateRequest,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.videoGenerationService.generateAiTravelVideo(userId, request);
  }

  @Get('status/:predictionId')
  async checkAiVideoStatus(@Param('predictionId') predictionId: string) {
    return this.videoGenerationService.checkAiVideoStatus(predictionId);
  }

  @Post('cancel/:predictionId')
  async cancelAiVideo(@Param('predictionId') predictionId: string) {
    return this.videoGenerationService.cancelAiVideo(predictionId);
  }

  @Get('music-tracks')
  async getMusicTracks() {
    return this.videoGenerationService.getMusicTracks();
  }

  @Get('travel-plans')
  async getTravelPlans() {
    return this.videoGenerationService.getTravelPlans();
  }

  @Post('generate-with-media')
  async generateAiTravelVideoWithMedia(
    @Body() request: AiVideoGenerateWithMediaRequest,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.videoGenerationService.generateAiTravelVideoWithMedia(
      userId,
      request,
    );
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadVideoImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.videoGenerationService.uploadVideoImage(userId, file);
  }
}
