import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('commission')
@UseGuards(JwtAuthGuard)
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('booking/:bookingId')
  async getBookingCommissions(@Param('bookingId') bookingId: string) {
    return this.commissionService.getCommissionsByBookingId(bookingId);
  }

  @Get('booking/:bookingId/total')
  async getBookingTotalCommission(@Param('bookingId') bookingId: string) {
    const total = await this.commissionService.getTotalCommission(bookingId);
    return { total };
  }

  @Get('user/my-commissions')
  async getUserCommissions(
    @GetUser() user: any,
    @Param('status') status?: string,
  ) {
    return this.commissionService.getUserCommissions(user.userId, status);
  }

  @Put(':id/status')
  async updateCommissionStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'confirmed' | 'paid' | 'cancelled',
  ) {
    return this.commissionService.updateCommissionStatus(id, status);
  }
}

