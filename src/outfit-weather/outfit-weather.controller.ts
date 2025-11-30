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
import { AnalyzeOutfitDto, ApproveOutfitDto, UploadOutfitDto } from './outfit-weather.dto';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import * as fs from 'node:fs';

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
    @Body() dto: UploadOutfitDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!dto.booking_id) {
      throw new BadRequestException('booking_id is required');
    }

    // Upload image to ImgBB
    const imageUrl = await this.outfitWeatherService.uploadOutfitImage(file);

    // Analyze outfit automatically after upload - pass file for base64 encoding
    let analysis;
    try {
      analysis = await this.outfitWeatherService.analyzeOutfit(
        req.user.sub,
        dto.booking_id,
        imageUrl,
        file, // Pass file for better OpenAI API compatibility
        dto.outfit_date, // Pass outfit date if provided
      );
    } finally {
      // Clean up local file after analysis
      try {
        const filePath = join(file.destination, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Cleaned up temporary file:', filePath);
        }
      } catch (error) {
        console.error('Error cleaning up file:', error);
        // Ignore cleanup errors
      }
    }

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

  @Get('booking/:bookingId/date/:date')
  async getOutfitByDate(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Param('date') date: string, // Format: YYYY-MM-DD
  ) {
    return this.outfitWeatherService.getOutfitByDate(
      req.user.sub,
      bookingId,
      date,
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

