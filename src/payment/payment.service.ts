import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

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
      transaction_id: params.transaction_id || `txn_${Math.random().toString(36).slice(2, 10)}`,
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

  async findByUser(userId: string) {
    return this.paymentModel.find({ user_id: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async findByTransactionId(transactionId: string) {
    return this.paymentModel.findOne({ transaction_id: transactionId }).exec();
  }

  async updateStatus(transactionId: string, status: string, metadata?: Record<string, any>) {
    const payment = await this.paymentModel.findOne({ transaction_id: transactionId }).exec();
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

