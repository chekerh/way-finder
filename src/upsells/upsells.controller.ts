import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UpsellsService } from './upsells.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upsells')
@UseGuards(JwtAuthGuard)
export class UpsellsController {
  constructor(private readonly upsellsService: UpsellsService) {}

  @Get('products')
  async getProducts(
    @Query('destinationId') destinationId?: string,
    @Query('dates') dates?: string,
  ) {
    const products = await this.upsellsService.getUpsellProducts(
      destinationId,
      dates,
    );
    return {
      products,
      destination: destinationId,
      dates,
    };
  }
}

