import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';

@Injectable()
export class PaymentService {
  constructor(@InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>) {}

  async record(params: {
    userId: string;
    amount: number;
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
    currency?: string;
    metadata?: Record<string, any>;
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
    return payment.save();
  }

  async findByUser(userId: string) {
    return this.paymentModel.find({ user_id: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async updateStatus(transactionId: string, status: string, metadata?: Record<string, any>) {
    const payment = await this.paymentModel.findOne({ transaction_id: transactionId }).exec();
    if (!payment) {
      return null;
    }

    payment.payment_status = status;
    if (metadata) {
      payment.metadata = { ...(payment.metadata || {}), ...metadata };
    }

    return payment.save();
  }
}

