import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaypalOrderDto } from './dto/paypal-order.dto';
import { PaymentService } from './payment.service';
import { PaypalService } from './paypal.service';
import {
  PaginationDto,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Payment Controller
 * Handles payment processing, payment history, and PayPal integration
 */
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paypalService: PaypalService,
  ) {}

  /**
   * Get user payment history with pagination
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async history(@Req() req: any, @Query() pagination?: PaginationDto) {
    const { page = 1, limit = 20 } = pagination || {};
    const result = await this.paymentService.findByUserPaginated(
      req.user.sub,
      page,
      limit,
    );
    return createPaginatedResponse(result.data, result.total, page, limit);
  }

  /**
   * Record a payment transaction manually
   * Useful for testing or recording payments from external systems
   * @body amount - Payment amount
   * @body payment_method - Payment method (Stripe, PayPal, etc.)
   * @body payment_status - Payment status (success, failed, pending)
   * @returns Saved payment document with notification sent
   */
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

  /**
   * Create a PayPal order for payment
   * Rate limited: 10 requests per minute to prevent abuse
   * @body CreatePaypalOrderDto - PayPal order creation data (amount, currency, bookingId, etc.)
   * @returns PayPal order details with approval URL
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
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

  /**
   * Capture a PayPal order after user approval
   * @param orderId - PayPal order ID
   * @body bookingId - Optional booking ID associated with payment
   * @returns PayPal capture details and updated payment status
   */
  /**
   * Capture a PayPal order payment
   * Rate limited: 5 requests per minute to prevent abuse
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('paypal/capture/:orderId')
  async capturePaypalOrder(
    @Param('orderId') orderId: string,
    @Body() body?: { bookingId?: string },
  ) {
    const capture = await this.paypalService.captureOrder(orderId);
    const paymentStatus =
      capture?.status === 'COMPLETED' ? 'success' : 'failed';

    // Find the payment to get the bookingId from metadata if not provided
    const existingPayment =
      await this.paymentService.findByTransactionId(orderId);
    const bookingId = body?.bookingId || existingPayment?.metadata?.bookingId;

    await this.paymentService.updateStatus(orderId, paymentStatus, {
      paypal_status: capture?.status,
      capture,
      bookingId,
    });

    return capture;
  }

  /**
   * Get PayPal order status
   * @param orderId - PayPal order ID
   * @returns PayPal order status and details
   */
  @UseGuards(JwtAuthGuard)
  @Get('paypal/status/:orderId')
  async getPaypalOrder(@Param('orderId') orderId: string) {
    return this.paypalService.getOrder(orderId);
  }
}
