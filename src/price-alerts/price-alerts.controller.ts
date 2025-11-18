import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PriceAlertsService } from './price-alerts.service';
import { CreatePriceAlertDto, UpdatePriceAlertDto } from './price-alerts.dto';

@Controller('price-alerts')
export class PriceAlertsController {
  constructor(private readonly priceAlertsService: PriceAlertsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPriceAlert(@Req() req: any, @Body() createPriceAlertDto: CreatePriceAlertDto) {
    const alert = await this.priceAlertsService.createPriceAlert(req.user.sub, createPriceAlertDto);
    const alertObj = (alert as any).toObject ? (alert as any).toObject() : alert;
    return alertObj;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserPriceAlerts(
    @Req() req: any,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const alerts = await this.priceAlertsService.getUserPriceAlerts(
      req.user.sub,
      activeOnly === 'true',
    );
    return alerts.map((alert) => {
      const alertObj = (alert as any).toObject ? (alert as any).toObject() : alert;
      return alertObj;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPriceAlert(@Req() req: any, @Param('id') alertId: string) {
    const alert = await this.priceAlertsService.getPriceAlert(req.user.sub, alertId);
    const alertObj = (alert as any).toObject ? (alert as any).toObject() : alert;
    return alertObj;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePriceAlert(
    @Req() req: any,
    @Param('id') alertId: string,
    @Body() updateDto: UpdatePriceAlertDto,
  ) {
    const alert = await this.priceAlertsService.updatePriceAlert(req.user.sub, alertId, updateDto);
    const alertObj = (alert as any).toObject ? (alert as any).toObject() : alert;
    return alertObj;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePriceAlert(@Req() req: any, @Param('id') alertId: string) {
    await this.priceAlertsService.deletePriceAlert(req.user.sub, alertId);
    return { message: 'Price alert deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/deactivate')
  async deactivatePriceAlert(@Req() req: any, @Param('id') alertId: string) {
    const alert = await this.priceAlertsService.deactivatePriceAlert(req.user.sub, alertId);
    const alertObj = (alert as any).toObject ? (alert as any).toObject() : alert;
    return alertObj;
  }
}

