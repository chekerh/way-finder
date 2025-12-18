import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BookingService } from './booking.service';
import {
  ConfirmBookingDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  PaginationDto,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';
import { RATE_LIMIT } from '../common/constants';

/**
 * Booking Controller
 * Handles flight and hotel booking operations, offers search, and booking management
 */
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Search for flight/hotel offers (mock data)
   * @query destination - Destination location
   * @query dates - Travel dates
   * @query type - Offer type (flight/hotel)
   * @returns Array of mock offers
   * @deprecated Consider using /catalog/recommended or /catalog/explore for real flight search
   */
  @Get('offers')
  async offers(@Query() query: any) {
    return this.bookingService.searchOffers(query);
  }

  /**
   * Compare offer prices and get detailed breakdown
   * @query offer_id - Offer identifier
   * @returns Price breakdown with base price, taxes, fees, and total
   */
  @Get('compare')
  async compare(@Query('offer_id') offer_id: string) {
    return this.bookingService.compare(offer_id);
  }

  /**
   * Confirm a booking
   * Rate limited: 30 requests per minute to allow normal usage while preventing abuse
   */
  @Throttle({ default: { limit: RATE_LIMIT.BOOKING_CONFIRM, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra properties (like null total_price)
      transform: true,
    }),
  )
  async confirm(@Req() req: any, @Body() dto: ConfirmBookingDto) {
    return this.bookingService.confirm(req.user.sub, dto);
  }

  /**
   * Get booking history with pagination
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async history(@Req() req: any, @Query() pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const result = await this.bookingService.historyPaginated(
      req.user.sub,
      page,
      limit,
    );
    return createPaginatedResponse(result.data, result.total, page, limit);
  }

  /**
   * List bookings with pagination (alias for history)
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any, @Query() pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const result = await this.bookingService.historyPaginated(
      req.user.sub,
      page,
      limit,
    );
    return createPaginatedResponse(result.data, result.total, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.bookingService.findOne(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingService.update(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancel(@Req() req: any, @Param('id') id: string) {
    return this.bookingService.cancel(req.user.sub, id);
  }

  /**
   * Request to rebook a cancelled booking
   * Sends emails to customer support and user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/rebook')
  async requestRebooking(@Req() req: any, @Param('id') id: string) {
    return this.bookingService.requestRebooking(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/permanent')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.bookingService.delete(req.user.sub, id);
    return { message: 'Booking permanently deleted' };
  }
}
