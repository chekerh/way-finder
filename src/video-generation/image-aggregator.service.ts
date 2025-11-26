import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Journey, JourneyDocument } from '../journey/journey.schema';

export interface AggregatedImages {
  imageUrls: string[];
  totalCount: number;
  journeyIds: string[];
  tags: string[];
  descriptions: string[];
  dates: Date[];
  metadata: {
    earliestDate: Date | null;
    latestDate: Date | null;
    uniqueTags: string[];
  };
}

@Injectable()
export class ImageAggregatorService {
  private readonly logger = new Logger(ImageAggregatorService.name);

  constructor(
    @InjectModel(Journey.name)
    private readonly journeyModel: Model<JourneyDocument>,
  ) {}

  private toObjectId(id: string, label: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return id as any;
  }

  /**
   * Aggregate all images from all posts for a given user and destination
   * @param userId - User ID
   * @param destination - Destination name (e.g., "Paris")
   * @returns Aggregated images with metadata
   */
  async aggregateImagesByDestination(
    userId: string,
    destination: string,
  ): Promise<AggregatedImages> {
    this.logger.log(
      `Aggregating images for user ${userId} and destination ${destination}`,
    );

    // Find all journeys for this user and destination
    const journeys = await this.journeyModel
      .find({
        user_id: this.toObjectId(userId, 'user id'),
        destination: destination.trim(),
        is_visible: true,
      })
      .sort({ createdAt: 1 }) // Sort by creation date (oldest first)
      .exec();

    if (journeys.length === 0) {
      this.logger.warn(
        `No journeys found for user ${userId} and destination ${destination}`,
      );
      return {
        imageUrls: [],
        totalCount: 0,
        journeyIds: [],
        tags: [],
        descriptions: [],
        dates: [],
        metadata: {
          earliestDate: null,
          latestDate: null,
          uniqueTags: [],
        },
      };
    }

    // Aggregate all image URLs
    const imageUrls: string[] = [];
    const journeyIds: string[] = [];
    const tags: string[] = [];
    const descriptions: string[] = [];
    const dates: Date[] = [];

    for (const journey of journeys) {
      journeyIds.push(journey._id.toString());

      // Collect image URLs (prefer slides, fallback to image_urls)
      if (journey.slides && journey.slides.length > 0) {
        journey.slides.forEach((slide) => {
          if (slide.imageUrl) {
            imageUrls.push(slide.imageUrl);
          }
        });
      } else if (journey.image_urls && journey.image_urls.length > 0) {
        imageUrls.push(...journey.image_urls);
      }

      // Collect tags
      if (journey.tags && journey.tags.length > 0) {
        tags.push(...journey.tags);
      }

      // Collect descriptions
      if (journey.description && journey.description.trim()) {
        descriptions.push(journey.description);
      }

      // Collect dates
      const journeyObj = journey.toObject ? journey.toObject() : journey;
      if ((journeyObj as any).createdAt) {
        dates.push(new Date((journeyObj as any).createdAt));
      }
    }

    // Remove duplicate image URLs (keep first occurrence)
    const uniqueImageUrls = Array.from(new Set(imageUrls));
    const uniqueTags = Array.from(new Set(tags));

    // Calculate metadata
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    const earliestDate = sortedDates.length > 0 ? sortedDates[0] : null;
    const latestDate =
      sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

    this.logger.log(
      `Aggregated ${uniqueImageUrls.length} images from ${journeys.length} journeys`,
    );

    return {
      imageUrls: uniqueImageUrls,
      totalCount: uniqueImageUrls.length,
      journeyIds,
      tags: uniqueTags,
      descriptions,
      dates: sortedDates,
      metadata: {
        earliestDate,
        latestDate,
        uniqueTags,
      },
    };
  }

  /**
   * Get all unique destinations for a user
   * @param userId - User ID
   * @returns List of unique destinations
   */
  async getUserDestinations(userId: string): Promise<string[]> {
    const journeys = await this.journeyModel
      .find({
        user_id: this.toObjectId(userId, 'user id'),
        is_visible: true,
      })
      .select('destination')
      .exec();

    const destinations = journeys
      .map((j) => j.destination?.trim())
      .filter((d) => d && d.length > 0);

    return Array.from(new Set(destinations));
  }
}
