import { Controller, Get, Post, Body, Query, UseGuards, Req, Param, Put, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ConfirmBookingDto, CreateBookingDto, UpdateBookingDto } from './booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('offers')
  async offers(@Query() query: any) {
    return this.bookingService.searchOffers(query);
  }

  @Get('compare')
  async compare(@Query('offer_id') offer_id: string) {
    return this.bookingService.compare(offer_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  async confirm(@Req() req: any, @Body() dto: ConfirmBookingDto) {
    return this.bookingService.confirm(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async history(@Req() req: any) {
    return this.bookingService.history(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any) {
    return this.bookingService.history(req.user.sub);
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
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.update(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancel(@Req() req: any, @Param('id') id: string) {
    return this.bookingService.cancel(req.user.sub, id);
  }
}
