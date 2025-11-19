import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JourneyService } from './journey.service';
import { CreateJourneyDto, UpdateJourneyDto, CreateJourneyCommentDto } from './journey.dto';

@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      // Allow up to 20 images
      storage: diskStorage({
        destination: './uploads/journeys',
        filename: (req, file, cb) => {
          const userId = (req as any).user?.sub;
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `journey-${userId}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per image
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createJourney(
    @Req() req: any,
    @Body() dto: CreateJourneyDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    // Generate image URLs
    const imageUrls = files.map((file) => `/uploads/journeys/${file.filename}`);

    return this.journeyService.createJourney(req.user.sub, dto, imageUrls);
  }

  @Get()
  async getJourneys(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const userId = (req as any).user?.sub;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    return this.journeyService.getJourneys(userId, limitNum, skipNum);
  }

  @Get('my-journeys')
  @UseGuards(JwtAuthGuard)
  async getMyJourneys(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    return this.journeyService.getUserJourneys(req.user.sub, limitNum, skipNum);
  }

  @Get('can-share')
  @UseGuards(JwtAuthGuard)
  async canShareJourney(@Req() req: any) {
    return this.journeyService.canUserShareJourney(req.user.sub);
  }

  @Get(':id')
  async getJourneyById(@Req() req: any, @Param('id') id: string) {
    const userId = (req as any).user?.sub;
    return this.journeyService.getJourneyById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateJourney(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateJourneyDto,
  ) {
    return this.journeyService.updateJourney(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteJourney(@Req() req: any, @Param('id') id: string) {
    return this.journeyService.deleteJourney(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeJourney(@Req() req: any, @Param('id') id: string) {
    return this.journeyService.likeJourney(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateJourneyCommentDto,
  ) {
    return this.journeyService.addComment(req.user.sub, id, dto);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    return this.journeyService.getComments(id, limitNum, skipNum);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(@Req() req: any, @Param('commentId') commentId: string) {
    return this.journeyService.deleteComment(req.user.sub, commentId);
  }
}

