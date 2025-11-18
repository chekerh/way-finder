import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { TravelTipsService } from './travel-tips.service';
import { GetTravelTipsDto, CreateTravelTipDto, MarkTipHelpfulDto, TravelTipCategory } from './travel-tips.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('travel-tips')
export class TravelTipsController {
  constructor(private readonly travelTipsService: TravelTipsService) {}

  @Get()
  async getTips(@Query() query: GetTravelTipsDto) {
    return this.travelTipsService.getTipsForDestination(query);
  }

  @Get('generate/:destinationId')
  async generateTips(
    @Param('destinationId') destinationId: string,
    @Query('destinationName') destinationName: string,
    @Query('city') city?: string,
    @Query('country') country?: string,
  ) {
    return this.travelTipsService.generateTipsForDestination(
      destinationId,
      destinationName,
      city,
      country,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTip(@Body() dto: CreateTravelTipDto) {
    return this.travelTipsService.createTip(dto);
  }

  @Post(':tipId/helpful')
  async markTipHelpful(@Param('tipId') tipId: string) {
    return this.travelTipsService.markTipHelpful(tipId);
  }

  @Get(':tipId')
  async getTipById(@Param('tipId') tipId: string) {
    return this.travelTipsService.getTipById(tipId);
  }
}

