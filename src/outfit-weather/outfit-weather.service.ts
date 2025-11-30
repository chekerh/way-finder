import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { Outfit, OutfitDocument } from './outfit.schema';
import { WeatherService } from './weather.service';
import { ImageAnalysisService } from './image-analysis.service';
import { BookingService } from '../booking/booking.service';
import { ImgBBService } from '../journey/imgbb.service';
import { BookingStatus } from '../common/enums/booking-status.enum';

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
    const filePath = path.join(file.destination, file.filename);
    const imageUrl = await this.imgbbService.uploadImage(
      filePath,
      `outfit-${Date.now()}.jpg`,
    );

    // Note: We keep the file temporarily for OpenAI analysis
    // It will be cleaned up after analysis in the controller or service
    // Don't delete here to allow base64 encoding

    return imageUrl;
  }

  /**
   * Analyze an outfit for a booking
   */
  async analyzeOutfit(
    userId: string,
    bookingId: string,
    imageUrl: string,
    imageFile?: Express.Multer.File,
    outfitDate?: string, // Optional date in format YYYY-MM-DD
  ): Promise<OutfitDocument> {
    // Get booking details
    const booking = await this.bookingService.findOne(userId, bookingId);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be confirmed to analyze outfit');
    }

    // Try to get destination from trip_details, fallback to offer_id if not available
    let destination = booking.trip_details?.destination;
    if (!destination) {
      // Fallback to offer_id if trip_details.destination is not set
      // This handles cases where bookings were created without trip_details
      destination = booking.offer_id;
      console.log(`[OutfitWeatherService] Using offer_id as destination fallback: ${destination}`);
    }
    
    if (!destination) {
      throw new BadRequestException('Booking destination not found');
    }

    // Get weather forecast for destination
    // If outfitDate is provided, use it; otherwise use departure_date or current date
    const targetDate = outfitDate 
      ? new Date(outfitDate)
      : booking.trip_details?.departure_date
      ? new Date(booking.trip_details.departure_date)
      : new Date();
    
    const weather = await this.weatherService.getWeatherForecast(
      destination,
      targetDate,
    );

    // Analyze outfit image - use file buffer if available for better accuracy
    const detectedItems = await this.imageAnalysisService.analyzeOutfit(
      imageUrl,
      imageFile,
    );
    
    console.log('Detected items from analysis service:', detectedItems);
    console.log('Detected items type:', typeof detectedItems, 'is array:', Array.isArray(detectedItems));

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

    // Translate detected items to French for display (items are in English for comparison)
    const detectedItemsFrench = this.translateItemsToFrench(detectedItems);

    // Create outfit record
    console.log('Creating outfit record with detected_items:', detectedItems);
    console.log('Translated to French:', detectedItemsFrench);
    const outfitData: any = {
      user_id: this.toObjectId(userId, 'user id') as any,
      booking_id: this.toObjectId(bookingId, 'booking id') as any,
      image_url: imageUrl,
      detected_items: detectedItemsFrench, // Store in French for display
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
    };

    // Add outfit_date if provided
    if (outfitDate) {
      outfitData.outfit_date = new Date(outfitDate);
      console.log('Outfit date set to:', outfitData.outfit_date);
      
      // If a date is provided, check if there's already an outfit for this date
      // and remove it to replace with the new one
      const outfitDateObj = new Date(outfitDate);
      outfitDateObj.setHours(0, 0, 0, 0);
      const nextDay = new Date(outfitDateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const existingOutfit = await this.outfitModel
        .findOne({
          user_id: this.toObjectId(userId, 'user id') as any,
          booking_id: this.toObjectId(bookingId, 'booking id') as any,
          outfit_date: {
            $gte: outfitDateObj,
            $lt: nextDay,
          },
        })
        .exec();
      
      if (existingOutfit) {
        console.log('Removing existing outfit for date:', outfitDate, 'ID:', existingOutfit._id);
        await this.outfitModel.deleteOne({ _id: existingOutfit._id }).exec();
      }
    }

    const outfit = new this.outfitModel(outfitData);

    const savedOutfit = await outfit.save();
    console.log('Saved outfit detected_items:', savedOutfit.detected_items);
    console.log('Saved outfit ID:', savedOutfit._id);
    return savedOutfit;
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
        user_id: this.toObjectId(userId, 'user id') as any,
        booking_id: this.toObjectId(bookingId, 'booking id') as any,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get outfit by date for a booking
   */
  async getOutfitByDate(
    userId: string,
    bookingId: string,
    date: string, // Format: YYYY-MM-DD
  ): Promise<OutfitDocument | null> {
    const outfitDate = new Date(date);
    // Set time to start of day for comparison
    outfitDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(outfitDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const outfit = await this.outfitModel
      .findOne({
        user_id: this.toObjectId(userId, 'user id') as any,
        booking_id: this.toObjectId(bookingId, 'booking id') as any,
        outfit_date: {
          $gte: outfitDate,
          $lt: nextDay,
        },
      })
      .sort({ createdAt: -1 }) // Get most recent if multiple
      .exec();

    return outfit;
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
        _id: this.toObjectId(outfitId, 'outfit id') as any,
        user_id: this.toObjectId(userId, 'user id') as any,
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
    
    // If outfit has a date, mark it as the validated outfit for that date
    // This ensures only one validated outfit per date
    if (outfit.outfit_date) {
      const outfitDate = new Date(outfit.outfit_date);
      outfitDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(outfitDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Unapprove other outfits for the same date
      await this.outfitModel
        .updateMany(
          {
            user_id: this.toObjectId(userId, 'user id') as any,
            booking_id: outfit.booking_id,
            outfit_date: {
              $gte: outfitDate,
              $lt: nextDay,
            },
            _id: { $ne: outfit._id },
          },
          { $set: { is_approved: false } }
        )
        .exec();
    }
    
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
        _id: this.toObjectId(outfitId, 'outfit id') as any,
        user_id: this.toObjectId(userId, 'user id') as any,
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Outfit not found');
    }
  }

  /**
   * Helper method to convert string to ObjectId with validation
   */
  private toObjectId(id: string, label: string): Types.ObjectId {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException(`Invalid ${label} provided`);
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label} format`);
    }
    return new Types.ObjectId(id);
  }

  /**
   * Translate English item names to French for display
   */
  private translateItemsToFrench(items: string[]): string[] {
    const translations: Record<string, string> = {
      't-shirt': 't-shirt',
      'shirt': 'chemise',
      'sweater': 'pull',
      'jacket': 'veste',
      'coat': 'manteau',
      'light-jacket': 'veste légère',
      'raincoat': 'imperméable',
      'jeans': 'jean',
      'shorts': 'short',
      'skirt': 'jupe',
      'dress': 'robe',
      'warm-pants': 'pantalon chaud',
      'sneakers': 'baskets',
      'boots': 'bottes',
      'sandals': 'sandales',
      'closed-shoes': 'chaussures fermées',
      'waterproof-shoes': 'chaussures imperméables',
      'winter-boots': 'bottes d\'hiver',
      'handbag': 'sac à main',
      'hat': 'chapeau',
      'scarf': 'écharpe',
      'gloves': 'gants',
      'sunglasses': 'lunettes de soleil',
      'umbrella': 'parapluie',
      'sunscreen': 'crème solaire',
    };

    return items.map(item => translations[item.toLowerCase()] || item);
  }
}

