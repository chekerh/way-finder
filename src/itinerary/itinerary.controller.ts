import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItineraryService } from './itinerary.service';
import {
  CreateItineraryDto,
  UpdateItineraryDto,
  ActivityDto,
} from './itinerary.dto';
import {
  PaginationDto,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Itinerary Controller
 * Handles travel itineraries, activities, and itinerary management
 */
@UseGuards(JwtAuthGuard)
@Controller('itinerary')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() createItineraryDto: CreateItineraryDto,
  ) {
    const itinerary = await this.itineraryService.create(
      req.user.sub,
      createItineraryDto,
    );
    const itineraryObj = (itinerary as any).toObject
      ? (itinerary as any).toObject()
      : itinerary;
    return itineraryObj;
  }

  /**
   * Get user itineraries with pagination
   * @query includePublic - Include public itineraries from other users (optional)
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @Get()
  async findAll(
    @Req() req: any,
    @Query('includePublic') includePublic?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = pagination || {};
    const result = await this.itineraryService.findAllPaginated(
      req.user.sub,
      page,
      limit,
      includePublic === 'true',
    );

    const data = result.data.map((itinerary) => {
      const itineraryObj = (itinerary as any).toObject
        ? (itinerary as any).toObject()
        : itinerary;
      return itineraryObj;
    });

    return createPaginatedResponse(data, result.total, page, limit);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const itinerary = await this.itineraryService.findOne(id, req.user.sub);
    const itineraryObj = (itinerary as any).toObject
      ? (itinerary as any).toObject()
      : itinerary;
    return itineraryObj;
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateItineraryDto: UpdateItineraryDto,
  ) {
    const itinerary = await this.itineraryService.update(
      id,
      req.user.sub,
      updateItineraryDto,
    );
    const itineraryObj = (itinerary as any).toObject
      ? (itinerary as any).toObject()
      : itinerary;
    return itineraryObj;
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.itineraryService.remove(id, req.user.sub);
    return { message: 'Itinerary deleted successfully' };
  }

  @Post(':id/days/:dayDate/activities')
  async addActivity(
    @Req() req: any,
    @Param('id') id: string,
    @Param('dayDate') dayDate: string,
    @Body() activity: ActivityDto,
  ) {
    const itinerary = await this.itineraryService.addActivity(
      id,
      req.user.sub,
      dayDate,
      activity,
    );
    const itineraryObj = (itinerary as any).toObject
      ? (itinerary as any).toObject()
      : itinerary;
    return itineraryObj;
  }

  @Delete(':id/days/:dayDate/activities/:activityIndex')
  async removeActivity(
    @Req() req: any,
    @Param('id') id: string,
    @Param('dayDate') dayDate: string,
    @Param('activityIndex') activityIndex: string,
  ) {
    const itinerary = await this.itineraryService.removeActivity(
      id,
      req.user.sub,
      dayDate,
      parseInt(activityIndex, 10),
    );
    const itineraryObj = (itinerary as any).toObject
      ? (itinerary as any).toObject()
      : itinerary;
    return itineraryObj;
  }
}
