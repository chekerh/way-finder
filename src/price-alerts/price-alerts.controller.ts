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
import {
  PaginationDto,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

@Controller('price-alerts')
export class PriceAlertsController {
  constructor(private readonly priceAlertsService: PriceAlertsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPriceAlert(
    @Req() req: any,
    @Body() createPriceAlertDto: CreatePriceAlertDto,
  ) {
    const alert = await this.priceAlertsService.createPriceAlert(
      req.user.sub,
      createPriceAlertDto,
    );
    const alertObj = (alert as any).toObject
      ? (alert as any).toObject()
      : alert;
    return alertObj;
  }

  /**
   * Get user price alerts with pagination
   * @query activeOnly - Filter to active alerts only (default: false)
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserPriceAlerts(
    @Req() req: any,
    @Query('activeOnly') activeOnly?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = pagination || {};
    const result = await this.priceAlertsService.getUserPriceAlertsPaginated(
      req.user.sub,
      page,
      limit,
      activeOnly === 'true',
    );

    const data = result.data.map((alert) => {
      const alertObj = (alert as any).toObject
        ? (alert as any).toObject()
        : alert;
      return alertObj;
    });

    return createPaginatedResponse(data, result.total, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPriceAlert(@Req() req: any, @Param('id') alertId: string) {
    const alert = await this.priceAlertsService.getPriceAlert(
      req.user.sub,
      alertId,
    );
    const alertObj = (alert as any).toObject
      ? (alert as any).toObject()
      : alert;
    return alertObj;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePriceAlert(
    @Req() req: any,
    @Param('id') alertId: string,
    @Body() updateDto: UpdatePriceAlertDto,
  ) {
    const alert = await this.priceAlertsService.updatePriceAlert(
      req.user.sub,
      alertId,
      updateDto,
    );
    const alertObj = (alert as any).toObject
      ? (alert as any).toObject()
      : alert;
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
    const alert = await this.priceAlertsService.deactivatePriceAlert(
      req.user.sub,
      alertId,
    );
    const alertObj = (alert as any).toObject
      ? (alert as any).toObject()
      : alert;
    return alertObj;
  }
}
