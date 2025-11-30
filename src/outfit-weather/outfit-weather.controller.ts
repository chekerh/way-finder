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

    // Analyze outfit FIRST with file (fast, no ImgBB upload needed for analysis)
    // Upload to ImgBB AFTER analysis for storage (non-blocking)
    let imageUrl: string;
    let analysis;
    
    try {
      // Use file path as temporary URL for analysis (file is used directly anyway)
      const filePath = join(file.destination, file.filename);
      const tempImageUrl = `file://${filePath}`;
      
      console.log('Starting outfit analysis immediately with file (no ImgBB wait)...');
      
      // Analyze outfit immediately - this is fast with fallback
      analysis = await this.outfitWeatherService.analyzeOutfit(
        req.user.sub,
        dto.booking_id,
        tempImageUrl, // Temporary URL, file will be used directly
        file, // Pass file for better OpenAI API compatibility and fallback
        dto.outfit_date, // Pass outfit date if provided
      );
      
      console.log('Outfit analysis completed, uploading to ImgBB for storage...');
      
      // Upload to ImgBB AFTER analysis (non-blocking, but we wait for it to update the URL)
      try {
        imageUrl = await Promise.race([
          this.outfitWeatherService.uploadOutfitImage(file),
          new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('ImgBB upload timeout')), 15000)
          )
        ]);
        
        // Update the outfit with the final image URL
        if (analysis && analysis._id) {
          analysis.image_url = imageUrl;
          await analysis.save();
          console.log('Updated outfit with ImgBB URL:', imageUrl);
        }
      } catch (imgbbError) {
        console.warn('ImgBB upload failed or timed out, using local file path:', imgbbError);
        // Use local file path as fallback
        imageUrl = `/uploads/outfits/${file.filename}`;
        
        // Update the outfit with fallback URL
        if (analysis && analysis._id) {
          analysis.image_url = imageUrl;
          await analysis.save();
        }
      }
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

