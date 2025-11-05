import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ConfirmBookingDto } from './booking.dto';
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
  async confirm(@Body() dto: ConfirmBookingDto) {
    return this.bookingService.confirm(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async history(@Req() req: any) {
    return this.bookingService.history(req.user.sub);
    }
}

