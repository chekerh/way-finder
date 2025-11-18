import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { FlouciService } from './flouci.service';
import { CreateFlouciPaymentDto } from './dto/flouci-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly flouciService: FlouciService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Post('flouci/create')
  async createFlouciPayment(@Req() req: any, @Body() dto: CreateFlouciPaymentDto) {
    // Generate app_transaction_id if not provided
    const appTransactionId = dto.app_transaction_id || `txn_${Date.now()}_${req.user.sub}`;
    
    const paymentRequest = {
      ...dto,
      app_transaction_id: appTransactionId,
      app_transaction_time: dto.app_transaction_time || Date.now(),
    };

    const result = await this.flouciService.createPayment(paymentRequest);
    
    // Record the payment attempt in the database
    await this.paymentService.record({
      userId: req.user.sub,
      amount: dto.amount,
      payment_method: 'Flouci',
      payment_status: 'pending',
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('flouci/status/:paymentId')
  async getFlouciPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.flouciService.getPaymentStatus(paymentId);
  }
}

