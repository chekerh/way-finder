import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OutfitWeatherService } from './outfit-weather.service';
import { AnalyzeOutfitDto, ApproveOutfitDto } from './outfit-weather.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('outfit-weather')
@UseGuards(JwtAuthGuard)
export class OutfitWeatherController {
  constructor(private readonly outfitWeatherService: OutfitWeatherService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/outfits',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadOutfitImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { booking_id: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!body.booking_id) {
      throw new BadRequestException('booking_id is required');
    }

    // Upload image to ImgBB
    const imageUrl = await this.outfitWeatherService.uploadOutfitImage(file);

    // Analyze outfit automatically after upload
    const analysis = await this.outfitWeatherService.analyzeOutfit(
      req.user.sub,
      body.booking_id,
      imageUrl,
    );

    return {
      message: 'Outfit image uploaded and analyzed successfully',
      image_url: imageUrl,
      analysis,
    };
  }

  @Post('analyze')
  async analyzeOutfit(@Request() req, @Body() dto: AnalyzeOutfitDto) {
    return this.outfitWeatherService.analyzeOutfit(
      req.user.sub,
      dto.booking_id,
      dto.image_url,
    );
  }

  @Get('booking/:bookingId')
  async getOutfitsForBooking(
    @Request() req,
    @Param('bookingId') bookingId: string,
  ) {
    return this.outfitWeatherService.getOutfitsForBooking(
      req.user.sub,
      bookingId,
    );
  }

  @Get(':outfitId')
  async getOutfit(@Request() req, @Param('outfitId') outfitId: string) {
    return this.outfitWeatherService.getOutfit(req.user.sub, outfitId);
  }

  @Post(':outfitId/approve')
  async approveOutfit(
    @Request() req,
    @Param('outfitId') outfitId: string,
    @Body() dto: ApproveOutfitDto,
  ) {
    return this.outfitWeatherService.approveOutfit(req.user.sub, outfitId);
  }

  @Delete(':outfitId')
  async deleteOutfit(@Request() req, @Param('outfitId') outfitId: string) {
    await this.outfitWeatherService.deleteOutfit(req.user.sub, outfitId);
    return { message: 'Outfit deleted successfully' };
  }
}

