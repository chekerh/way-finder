import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Itinerary, ItineraryDocument } from './itinerary.schema';
import { CreateItineraryDto, UpdateItineraryDto } from './itinerary.dto';

@Injectable()
export class ItineraryService {
  constructor(
    @InjectModel(Itinerary.name)
    private readonly itineraryModel: Model<ItineraryDocument>,
  ) {}

  async create(
    userId: string,
    createItineraryDto: CreateItineraryDto,
  ): Promise<Itinerary> {
    const createdItinerary = new this.itineraryModel({
      userId,
      ...createItineraryDto,
      days: createItineraryDto.days || [],
    });
    return createdItinerary.save();
  }

  /**
   * Get user itineraries (non-paginated - for backward compatibility)
   * @deprecated Use findAllPaginated instead for better performance
   */
  async findAll(
    userId: string,
    includePublic: boolean = false,
  ): Promise<Itinerary[]> {
    const query: any = {};

    if (includePublic) {
      // Get user's own itineraries OR public itineraries from other users
      query.$or = [{ userId }, { isPublic: true, userId: { $ne: userId } }];
    } else {
      // Only user's own itineraries
      query.userId = userId;
    }

    return this.itineraryModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  /**
   * Get paginated user itineraries
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @param includePublic - Include public itineraries from other users
   * @returns Paginated itinerary results
   */
  async findAllPaginated(
    userId: string,
    page: number,
    limit: number,
    includePublic: boolean = false,
  ) {
    const query: any = {};

    if (includePublic) {
      // Get user's own itineraries OR public itineraries from other users
      query.$or = [{ userId }, { isPublic: true, userId: { $ne: userId } }];
    } else {
      // Only user's own itineraries
      query.userId = userId;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.itineraryModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.itineraryModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string, userId: string): Promise<Itinerary> {
    const itinerary = await this.itineraryModel.findById(id).exec();

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    // Check if user has access (owner or public)
    if (itinerary.userId.toString() !== userId && !itinerary.isPublic) {
      throw new ForbiddenException('You do not have access to this itinerary');
    }

    return itinerary;
  }

  async update(
    id: string,
    userId: string,
    updateItineraryDto: UpdateItineraryDto,
  ): Promise<Itinerary> {
    const itinerary = await this.itineraryModel.findById(id).exec();

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    if (itinerary.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own itineraries');
    }

    Object.assign(itinerary, updateItineraryDto);
    return itinerary.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const itinerary = await this.itineraryModel.findById(id).exec();

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    if (itinerary.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own itineraries');
    }

    await this.itineraryModel.findByIdAndDelete(id).exec();
  }

  async addActivity(
    id: string,
    userId: string,
    dayDate: string,
    activity: any,
  ): Promise<Itinerary> {
    const itinerary = await this.itineraryModel.findById(id).exec();

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    if (itinerary.userId.toString() !== userId) {
      throw new ForbiddenException('You can only modify your own itineraries');
    }

    let dayPlan = itinerary.days.find((day) => day.date === dayDate);

    if (!dayPlan) {
      // Create new day plan if it doesn't exist
      dayPlan = {
        date: dayDate,
        activities: [],
        notes: undefined,
      };
      itinerary.days.push(dayPlan);
    }

    dayPlan.activities.push(activity);
    return itinerary.save();
  }

  async removeActivity(
    id: string,
    userId: string,
    dayDate: string,
    activityIndex: number,
  ): Promise<Itinerary> {
    const itinerary = await this.itineraryModel.findById(id).exec();

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    if (itinerary.userId.toString() !== userId) {
      throw new ForbiddenException('You can only modify your own itineraries');
    }

    const dayPlan = itinerary.days.find((day) => day.date === dayDate);

    if (!dayPlan || !dayPlan.activities[activityIndex]) {
      throw new NotFoundException('Activity not found');
    }

    dayPlan.activities.splice(activityIndex, 1);
    return itinerary.save();
  }
}
