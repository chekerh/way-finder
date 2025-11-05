import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './booking.schema';
import { ConfirmBookingDto } from './booking.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async searchOffers(query: { destination?: string; dates?: string; type?: string }) {
    // Stub: integrate with providers later
    return [
      { id: 'offer_1', type: query.type ?? 'flight', destination: query.destination ?? 'N/A', price: 199 },
      { id: 'offer_2', type: query.type ?? 'hotel', destination: query.destination ?? 'N/A', price: 99 },
    ];
  }

  async compare(offer_id: string) {
    // Stub breakdown
    return {
      offer_id,
      base_price: 150,
      taxes: 30,
      baggage: 20,
      service_fees: 10,
      total: 210,
    };
  }

  async confirm(dto: ConfirmBookingDto) {
    const confirmation_number = `CONF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const total_price = 200; // would be computed from compare
    const booking = new this.bookingModel({
      user_id: new Types.ObjectId(dto.user_id),
      offer_id: dto.offer_id,
      status: BookingStatus.CONFIRMED,
      payment_details: dto.payment_details,
      booking_date: new Date(),
      confirmation_number,
      total_price,
    });
    return booking.save();
  }

  async history(userId: string) {
    return this.bookingModel.find({ user_id: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }
}

