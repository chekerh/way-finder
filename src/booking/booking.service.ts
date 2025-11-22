import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './booking.schema';
import { ConfirmBookingDto, CreateBookingDto, UpdateBookingDto } from './booking.dto';
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

  private toObjectId(id: string, label: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label} provided`);
    }
    return new Types.ObjectId(id);
  }

  async confirm(userId: string, dto: ConfirmBookingDto) {
    const confirmation_number = `CONF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const total_price = dto.total_price ?? 0;
    const booking = new this.bookingModel({
      user_id: this.toObjectId(userId, 'user id'),
      offer_id: dto.offer_id,
      status: BookingStatus.CONFIRMED,
      payment_details: dto.payment_details,
      booking_date: new Date(),
      confirmation_number,
      total_price,
      trip_details: dto.trip_details, // Include trip details (destination, etc.)
    });
    return booking.save();
  }

  async history(userId: string) {
    return this.bookingModel
      .find({ user_id: this.toObjectId(userId, 'user id') })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(userId: string, dto: CreateBookingDto) {
    const confirmation_number = `CONF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const booking = new this.bookingModel({
      user_id: this.toObjectId(userId, 'user id'),
      offer_id: dto.offer_id,
      trip_details: dto.trip_details,
      passengers: dto.passengers,
      notes: dto.notes,
      status: BookingStatus.PENDING,
      payment_details: dto.payment_details,
      booking_date: new Date(),
      confirmation_number,
      total_price: dto.total_price ?? 0,
    });
    return booking.save();
  }

  async findOne(userId: string, bookingId: string) {
    const booking = await this.bookingModel
      .findOne({
        _id: this.toObjectId(bookingId, 'booking id'),
        user_id: this.toObjectId(userId, 'user id'),
      })
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async update(userId: string, bookingId: string, dto: UpdateBookingDto) {
    const booking = await this.bookingModel
      .findOneAndUpdate(
        { _id: this.toObjectId(bookingId, 'booking id'), user_id: this.toObjectId(userId, 'user id') },
        {
          $set: {
            ...('trip_details' in dto ? { trip_details: dto.trip_details } : {}),
            ...('passengers' in dto ? { passengers: dto.passengers } : {}),
            ...('notes' in dto ? { notes: dto.notes } : {}),
            ...('status' in dto ? { status: dto.status } : {}),
            ...('payment_details' in dto ? { payment_details: dto.payment_details } : {}),
            ...('total_price' in dto ? { total_price: dto.total_price } : {}),
          },
        },
        { new: true, runValidators: true },
      )
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async cancel(userId: string, bookingId: string) {
    const booking = await this.bookingModel
      .findOneAndUpdate(
        { _id: this.toObjectId(bookingId, 'booking id'), user_id: this.toObjectId(userId, 'user id') },
        { $set: { status: BookingStatus.CANCELLED } },
        { new: true },
      )
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }
}
