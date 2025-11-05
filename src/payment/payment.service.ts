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
  }) {
    const payment = new this.paymentModel({
      transaction_id: `txn_${Math.random().toString(36).slice(2, 10)}`,
      user_id: new Types.ObjectId(params.userId),
      amount: params.amount,
      payment_status: params.payment_status,
      transaction_date: new Date(),
      payment_method: params.payment_method,
    });
    return payment.save();
  }

  async findByUser(userId: string) {
    return this.paymentModel.find({ user_id: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }
}

