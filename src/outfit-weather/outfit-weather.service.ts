import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Outfit, OutfitDocument } from './outfit.schema';
import { WeatherService } from './weather.service';
import { ImageAnalysisService } from './image-analysis.service';
import { BookingService } from '../booking/booking.service';
import { ImgBBService } from '../journey/imgbb.service';

@Injectable()
export class OutfitWeatherService {
  constructor(
    @InjectModel(Outfit.name)
    private readonly outfitModel: Model<OutfitDocument>,
    private readonly weatherService: WeatherService,
    private readonly imageAnalysisService: ImageAnalysisService,
    private readonly bookingService: BookingService,
    private readonly imgbbService: ImgBBService,
  ) {}

  /**
   * Upload outfit image and get URL
   */
  async uploadOutfitImage(
    file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to ImgBB using existing service
    const filePath = require('path').join(file.destination, file.filename);
    const imageUrl = await this.imgbbService.uploadImage(
      filePath,
      `outfit-${Date.now()}.jpg`,
    );

    // Clean up local file
    try {
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    return imageUrl;
  }

  /**
   * Analyze an outfit for a booking
   */
  async analyzeOutfit(
    userId: string,
    bookingId: string,
    imageUrl: string,
  ): Promise<OutfitDocument> {
    // Get booking details
    const booking = await this.bookingService.findOne(userId, bookingId);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Booking must be confirmed to analyze outfit');
    }

    const destination = booking.trip_details?.destination;
    if (!destination) {
      throw new BadRequestException('Booking destination not found');
    }

    // Get weather forecast for destination
    const departureDate = booking.trip_details?.departure_date
      ? new Date(booking.trip_details.departure_date)
      : new Date();
    
    const weather = await this.weatherService.getWeatherForecast(
      destination,
      departureDate,
    );

    // Analyze outfit image
    const detectedItems = await this.imageAnalysisService.analyzeOutfit(
      imageUrl,
    );

    // Get clothing recommendations
    const recommendations = this.weatherService.getClothingRecommendations(
      weather,
    );

    // Compare detected items with recommendations
    const comparison = this.imageAnalysisService.compareWithWeather(
      detectedItems,
      recommendations.suitable_items,
      recommendations.unsuitable_items,
    );

    // Create outfit record
    const outfit = new this.outfitModel({
      user_id: new Types.ObjectId(userId),
      booking_id: new Types.ObjectId(bookingId),
      image_url: imageUrl,
      detected_items: detectedItems,
      weather_data: {
        temperature: weather.temperature,
        condition: weather.condition,
        humidity: weather.humidity,
        wind_speed: weather.wind_speed,
      },
      recommendation: {
        is_suitable: comparison.score >= 60,
        score: comparison.score,
        feedback: comparison.feedback,
        suggestions: [
          ...comparison.suggestions,
          ...recommendations.suggestions,
        ],
      },
    });

    return outfit.save();
  }

  /**
   * Get all outfits for a booking
   */
  async getOutfitsForBooking(
    userId: string,
    bookingId: string,
  ): Promise<OutfitDocument[]> {
    return this.outfitModel
      .find({
        user_id: new Types.ObjectId(userId),
        booking_id: new Types.ObjectId(bookingId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a specific outfit
   */
  async getOutfit(
    userId: string,
    outfitId: string,
  ): Promise<OutfitDocument> {
    const outfit = await this.outfitModel
      .findOne({
        _id: new Types.ObjectId(outfitId),
        user_id: new Types.ObjectId(userId),
      })
      .exec();

    if (!outfit) {
      throw new NotFoundException('Outfit not found');
    }

    return outfit;
  }

  /**
   * Approve an outfit
   */
  async approveOutfit(
    userId: string,
    outfitId: string,
  ): Promise<OutfitDocument> {
    const outfit = await this.getOutfit(userId, outfitId);
    outfit.is_approved = true;
    return outfit.save();
  }

  /**
   * Delete an outfit
   */
  async deleteOutfit(
    userId: string,
    outfitId: string,
  ): Promise<void> {
    const result = await this.outfitModel
      .deleteOne({
        _id: new Types.ObjectId(outfitId),
        user_id: new Types.ObjectId(userId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Outfit not found');
    }
  }
}

