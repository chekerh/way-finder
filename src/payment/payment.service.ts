import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Record a payment transaction
   * @param params - Payment parameters
   * @param params.userId - User ID
   * @param params.amount - Payment amount
   * @param params.payment_method - Payment method (Stripe, PayPal, etc.)
   * @param params.payment_status - Payment status (success, failed, pending)
   * @param params.transaction_id - Optional transaction ID (auto-generated if not provided)
   * @param params.currency - Currency code (default: USD)
   * @param params.metadata - Additional metadata
   * @param params.bookingId - Associated booking ID
   * @returns Saved payment document
   */
  async record(params: {
    userId: string;
    amount: number;
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
    currency?: string;
    metadata?: Record<string, any>;
    bookingId?: string;
  }) {
    const payment = new this.paymentModel({
      transaction_id:
        params.transaction_id ||
        `txn_${Math.random().toString(36).slice(2, 10)}`,
      user_id: new Types.ObjectId(params.userId),
      amount: params.amount,
      payment_status: params.payment_status,
      transaction_date: new Date(),
      payment_method: params.payment_method,
      currency: params.currency || 'USD',
      metadata: params.metadata || {},
    });
    const savedPayment = await payment.save();

    // Send notification based on payment status
    if (params.payment_status === 'success') {
      await this.notificationsService.createPaymentNotification(
        params.userId,
        'payment_success',
        params.bookingId || savedPayment._id.toString(),
        params.amount,
      );
    } else if (params.payment_status === 'failed') {
      await this.notificationsService.createPaymentNotification(
        params.userId,
        'payment_failed',
        params.bookingId || savedPayment._id.toString(),
        params.amount,
      );
    }

    return savedPayment;
  }

  /**
   * Get user payments (non-paginated - for backward compatibility)
   * @deprecated Use findByUserPaginated instead for better performance
   */
  async findByUser(userId: string) {
    return this.paymentModel
      .find({ user_id: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  /**
   * Get paginated user payment history
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Paginated payment results
   */
  async findByUserPaginated(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query = { user_id: new Types.ObjectId(userId) };

    const [data, total] = await Promise.all([
      this.paymentModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  /**
   * Find payment by transaction ID
   * @param transactionId - Transaction ID
   * @returns Payment document or null if not found
   */
  async findByTransactionId(transactionId: string) {
    return this.paymentModel.findOne({ transaction_id: transactionId }).exec();
  }

  /**
   * Update payment status
   * @param transactionId - Transaction ID
   * @param status - New payment status
   * @param metadata - Optional metadata to merge
   * @returns Updated payment document or null if not found
   */
  async updateStatus(
    transactionId: string,
    status: string,
    metadata?: Record<string, any>,
  ) {
    const payment = await this.paymentModel
      .findOne({ transaction_id: transactionId })
      .exec();
    if (!payment) {
      return null;
    }

    const oldStatus = payment.payment_status;
    payment.payment_status = status;
    if (metadata) {
      payment.metadata = { ...(payment.metadata || {}), ...metadata };
    }

    const savedPayment = await payment.save();

    // Send notification if status changed to success or failed
    if (oldStatus !== status && (status === 'success' || status === 'failed')) {
      const bookingId = metadata?.bookingId || savedPayment._id.toString();
      await this.notificationsService.createPaymentNotification(
        savedPayment.user_id.toString(),
        status === 'success' ? 'payment_success' : 'payment_failed',
        bookingId,
        savedPayment.amount,
      );
    }

    return savedPayment;
  }
}
