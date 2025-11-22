import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaypalOrderDto } from './dto/paypal-order.dto';
import { PaymentService } from './payment.service';
import { PaypalService } from './paypal.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paypalService: PaypalService,
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
  @Post('paypal/create')
  async createPaypalOrder(@Req() req: any, @Body() dto: CreatePaypalOrderDto) {
    const order = await this.paypalService.createOrder(dto, req.user.sub);
    const approvalUrl = this.paypalService.getApprovalLink(order);
    const purchaseUnit = order?.purchase_units?.[0];

    await this.paymentService.record({
      userId: req.user.sub,
      amount: Number(purchaseUnit?.amount?.value || dto.amount),
      payment_method: 'PayPal',
      payment_status: 'pending',
      transaction_id: order?.id,
      currency: purchaseUnit?.amount?.currency_code || dto.currency,
      bookingId: (dto as any).bookingId, // Pass bookingId if provided
      metadata: {
        paypal_status: order?.status,
        approval_url: approvalUrl,
        reference_id: purchaseUnit?.reference_id,
        bookingId: (dto as any).bookingId, // Store bookingId in metadata as well
      },
    });

    return {
      orderId: order?.id,
      status: order?.status,
      approvalUrl,
      purchaseUnits: order?.purchase_units,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('paypal/capture/:orderId')
  async capturePaypalOrder(@Param('orderId') orderId: string, @Body() body?: { bookingId?: string }) {
    const capture = await this.paypalService.captureOrder(orderId);
    const paymentStatus = capture?.status === 'COMPLETED' ? 'success' : 'failed';

    // Find the payment to get the bookingId from metadata if not provided
    const existingPayment = await this.paymentService.findByTransactionId(orderId);
    const bookingId = body?.bookingId || existingPayment?.metadata?.bookingId;

    await this.paymentService.updateStatus(orderId, paymentStatus, {
      paypal_status: capture?.status,
      capture,
      bookingId,
    });

    return capture;
  }

  @UseGuards(JwtAuthGuard)
  @Get('paypal/status/:orderId')
  async getPaypalOrder(@Param('orderId') orderId: string) {
    return this.paypalService.getOrder(orderId);
  }
}

