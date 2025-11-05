import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(@Req() req: any) {
    return this.paymentService.findByUser(req.user.sub);
  }

  // Simple stub to record a payment entry (for testing)
  @UseGuards(JwtAuthGuard)
  @Post('record')
  record(@Req() req: any, @Body() body: any) {
    return this.paymentService.record({
      userId: req.user.sub,
      amount: body.amount ?? 0,
      payment_method: body.payment_method ?? 'Stripe',
      payment_status: body.payment_status ?? 'success',
    });
  }
}

