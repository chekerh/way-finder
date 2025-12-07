import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './booking.schema';
import {
  ConfirmBookingDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './booking.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { RewardsService } from '../rewards/rewards.service';
import { PointsSource } from '../rewards/rewards.dto';
import { UserService } from '../user/user.service';
import { CommissionService } from '../commission/commission.service';

/**
 * Booking Service
 * Handles flight booking operations, offers search, booking confirmation, and booking management
 */
@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly rewardsService: RewardsService,
    private readonly userService: UserService,
    private readonly commissionService: CommissionService,
  ) {}

  /**
   * Search for flight/hotel offers
   * Returns mock offer data for testing/development purposes.
   * For production flight search, use the CatalogService endpoints:
   * - GET /catalog/recommended (personalized flights)
   * - GET /catalog/explore (explore offers)
   *
   * @param query - Search parameters (destination, dates, type)
   * @returns Array of mock offers with realistic structure
   * @deprecated Consider using CatalogService for real flight search in production
   */
  async searchOffers(query: {
    destination?: string;
    dates?: string;
    type?: string;
  }) {
    this.logger.debug(
      `Searching offers: destination=${query.destination}, type=${query.type}`,
    );
    const offerType = query.type ?? 'flight';
    const destination = query.destination ?? 'Unknown';

    // Return realistic mock offers for testing
    if (offerType === 'flight') {
      return [
        {
          id: `offer_flight_${Date.now()}`,
          type: 'flight',
          destination,
          origin: 'TUN',
          price: 299.99,
          currency: 'USD',
          departure_date: query.dates || new Date().toISOString().split('T')[0],
          airline: 'Example Airlines',
          duration: '2h 30m',
          stops: 0,
        },
        {
          id: `offer_flight_${Date.now() + 1}`,
          type: 'flight',
          destination,
          origin: 'TUN',
          price: 349.99,
          currency: 'USD',
          departure_date: query.dates || new Date().toISOString().split('T')[0],
          airline: 'Premium Airlines',
          duration: '2h 15m',
          stops: 0,
        },
      ];
    }

    // Hotel offers
    return [
      {
        id: `offer_hotel_${Date.now()}`,
        type: 'hotel',
        destination,
        name: 'Example Hotel',
        price: 89.99,
        currency: 'USD',
        check_in: query.dates || new Date().toISOString().split('T')[0],
        rating: 4.5,
        amenities: ['WiFi', 'Pool', 'Gym'],
      },
      {
        id: `offer_hotel_${Date.now() + 1}`,
        type: 'hotel',
        destination,
        name: 'Premium Hotel',
        price: 149.99,
        currency: 'USD',
        check_in: query.dates || new Date().toISOString().split('T')[0],
        rating: 4.8,
        amenities: ['WiFi', 'Pool', 'Gym', 'Spa'],
      },
    ];
  }

  /**
   * Compare offer prices (breakdown of costs)
   * Returns mock price breakdown for testing/development purposes.
   * In production, this should fetch actual pricing from the offer provider.
   *
   * @param offer_id - Offer identifier
   * @returns Detailed price breakdown with base price, taxes, fees, and total
   * @deprecated Consider integrating with actual offer provider for real pricing
   */
  async compare(offer_id: string) {
    this.logger.debug(`Comparing prices for offer: ${offer_id}`);

    if (!offer_id || offer_id.trim() === '') {
      throw new BadRequestException('Offer ID is required');
    }

    // Return realistic mock price breakdown
    const basePrice = Math.floor(Math.random() * 200) + 150; // $150-$350
    const taxes = Math.round(basePrice * 0.15); // 15% taxes
    const baggage = Math.round(Math.random() * 30) + 10; // $10-$40
    const serviceFees = Math.round(basePrice * 0.05); // 5% service fee
    const total = basePrice + taxes + baggage + serviceFees;

    return {
      offer_id,
      breakdown: {
        base_price: basePrice,
        taxes,
        baggage_fees: baggage,
        service_fees: serviceFees,
        currency: 'USD',
      },
      total,
      savings: null, // Could include comparison with other offers
      notes: 'Mock pricing data - use CatalogService for real pricing',
    };
  }

  private toObjectId(id: string, label: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label} provided`);
    }
    return new Types.ObjectId(id);
  }

  /**
   * Confirm and create a booking
   * Awards points, sends notification, and creates booking record
   * @param userId - User ID making the booking
   * @param dto - Booking confirmation data
   * @returns Created booking document
   * @throws BadRequestException if user already has confirmed booking for this offer
   */
  async confirm(userId: string, dto: ConfirmBookingDto) {
    // Check if user already has a confirmed booking for this offer
    const existingBooking = await this.bookingModel
      .findOne({
        user_id: this.toObjectId(userId, 'user id'),
        offer_id: dto.offer_id,
        status: BookingStatus.CONFIRMED,
      })
      .exec();

    if (existingBooking) {
      throw new BadRequestException(
        'Vous avez déjà une réservation confirmée pour cette offre. Vous ne pouvez pas réserver deux fois le même voyage.',
      );
    }

    const confirmation_number = `CONF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const total_price = dto.total_price ?? 0;
    
    // Calculate commission breakdown
    let flightCommission = 0;
    let accommodationCommission = 0;
    let upsellCommission = 0;
    
    // Calculate flight commission (assume base price is flight price)
    const flightCalculation = this.commissionService.calculateCommission(
      total_price * 0.7, // Estimate 70% is flight, adjust based on your pricing
      'flight',
    );
    flightCommission = flightCalculation.commissionAmount;
    
    // Calculate accommodation commission if present
    if (dto.accommodation) {
      const accCalculation = this.commissionService.calculateCommission(
        dto.accommodation.price,
        'accommodation',
      );
      accommodationCommission = accCalculation.commissionAmount;
    }
    
    // Calculate upsell commissions
    if (dto.upsells && dto.upsells.length > 0) {
      upsellCommission = dto.upsells.reduce(
        (sum, upsell) => sum + upsell.commission_amount * upsell.quantity,
        0,
      );
    }
    
    const totalCommission = flightCommission + accommodationCommission + upsellCommission;
    
    const booking = new this.bookingModel({
      user_id: this.toObjectId(userId, 'user id'),
      offer_id: dto.offer_id,
      status: BookingStatus.CONFIRMED,
      payment_details: dto.payment_details,
      booking_date: new Date(),
      confirmation_number,
      total_price,
      trip_details: dto.trip_details,
      accommodation: dto.accommodation,
      upsells: dto.upsells,
      commission_breakdown: {
        flight_commission: flightCommission,
        accommodation_commission: accommodationCommission,
        upsell_commission: upsellCommission,
        total_commission: totalCommission,
      },
    });
    const savedBooking = await booking.save();
    
    // Create commission records
    try {
      const commissionItems = [];
      
      // Flight commission
      commissionItems.push({
        type: 'flight' as const,
        id: dto.offer_id,
        name: dto.trip_details?.destination || 'Flight',
        basePrice: total_price * 0.7,
        currency: 'EUR',
      });
      
      // Accommodation commission
      if (dto.accommodation) {
        commissionItems.push({
          type: 'accommodation' as const,
          id: dto.accommodation.id,
          name: dto.accommodation.name,
          basePrice: dto.accommodation.price,
          currency: dto.accommodation.currency,
        });
      }
      
      // Upsell commissions
      if (dto.upsells && dto.upsells.length > 0) {
        dto.upsells.forEach((upsell) => {
          commissionItems.push({
            type: 'upsell' as const,
            id: upsell.product_id,
            name: `Upsell ${upsell.product_id}`,
            basePrice: upsell.price,
            currency: upsell.currency,
            category: upsell.product_id.split('_')[0], // Extract category from product_id
          });
        });
      }
      
      await this.commissionService.createCommissions(
        savedBooking._id.toString(),
        userId,
        commissionItems,
      );
      
      // Confirm commissions
      await this.commissionService.confirmCommissions(savedBooking._id.toString());
    } catch (error) {
      this.logger.warn(`Failed to create commissions: ${error.message}`);
      // Don't fail booking if commission creation fails
    }

    // Award points for booking a flight (+50 points)
    try {
      const points = this.rewardsService.getPointsForAction(
        PointsSource.BOOKING,
      );
      await this.rewardsService.awardPoints({
        userId,
        points,
        source: PointsSource.BOOKING,
        description: 'Booked a flight',
        metadata: {
          booking_id: savedBooking._id.toString(),
          confirmation_number,
          destination: dto.trip_details?.destination,
        },
      });

      // Increment lifetime metrics
      await this.userService.incrementLifetimeMetric(userId, 'total_bookings');

      this.logger.log(`Awarded ${points} points to user ${userId} for booking`);
    } catch (error) {
      this.logger.warn(`Failed to award points for booking: ${error.message}`);
      // Don't fail booking if points fail
    }

    // Send notification for confirmed booking
    const destinationName =
      dto.trip_details?.destination || 'votre destination';
    await this.notificationsService.createBookingNotification(
      userId,
      'booking_confirmed',
      savedBooking._id.toString(),
      `Votre réservation pour ${destinationName} a été confirmée. Numéro de confirmation: ${confirmation_number}`,
      {
        confirmationNumber: confirmation_number,
        totalPrice: total_price,
        tripDetails: dto.trip_details,
      },
    );

    return savedBooking;
  }

  /**
   * Get booking history (non-paginated - for backward compatibility)
   * @deprecated Use historyPaginated instead for better performance
   */
  async history(userId: string) {
    return this.bookingModel
      .find({ user_id: this.toObjectId(userId, 'user id') })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to prevent memory issues
      .exec();
  }

  /**
   * Get paginated booking history
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Paginated booking results
   */
  async historyPaginated(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.bookingModel
        .find({ user_id: this.toObjectId(userId, 'user id') })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel
        .countDocuments({ user_id: this.toObjectId(userId, 'user id') })
        .exec(),
    ]);

    return { data, total };
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
    // Get old booking to compare status changes
    const oldBooking = await this.bookingModel
      .findOne({
        _id: this.toObjectId(bookingId, 'booking id'),
        user_id: this.toObjectId(userId, 'user id'),
      })
      .exec();

    if (!oldBooking) {
      throw new NotFoundException('Booking not found');
    }

    const oldStatus = oldBooking.status;

    const booking = await this.bookingModel
      .findOneAndUpdate(
        {
          _id: this.toObjectId(bookingId, 'booking id'),
          user_id: this.toObjectId(userId, 'user id'),
        },
        {
          $set: {
            ...('trip_details' in dto
              ? { trip_details: dto.trip_details }
              : {}),
            ...('passengers' in dto ? { passengers: dto.passengers } : {}),
            ...('notes' in dto ? { notes: dto.notes } : {}),
            ...('status' in dto ? { status: dto.status } : {}),
            ...('payment_details' in dto
              ? { payment_details: dto.payment_details }
              : {}),
            ...('total_price' in dto ? { total_price: dto.total_price } : {}),
          },
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Send notification if status changed
    // IMPORTANT: If status changes to CANCELLED via update(), don't create notification
    // because cancel() method should be used for cancellations and it already creates the notification
    // This prevents duplicate cancellation notifications
    if (
      'status' in dto &&
      dto.status !== oldStatus &&
      dto.status !== BookingStatus.CANCELLED
    ) {
      const destinationName =
        booking.trip_details?.destination ||
        booking.trip_details?.origin ||
        'votre destination';
      let message = '';

      if (dto.status === BookingStatus.CONFIRMED) {
        message = `Votre réservation pour ${destinationName} a été confirmée. Numéro de confirmation: ${booking.confirmation_number}`;
      } else {
        message = `Votre réservation pour ${destinationName} a été mise à jour.`;
      }

      await this.notificationsService.createBookingNotification(
        userId,
        dto.status === BookingStatus.CONFIRMED
          ? 'booking_confirmed'
          : 'booking_updated',
        booking._id.toString(),
        message,
        {
          confirmationNumber: booking.confirmation_number,
          totalPrice: booking.total_price,
          tripDetails: booking.trip_details,
        },
      );
    } else if (dto.trip_details || dto.total_price || dto.passengers) {
      // Send update notification if important fields changed (but status didn't)
      const destinationName =
        booking.trip_details?.destination ||
        booking.trip_details?.origin ||
        'votre destination';
      await this.notificationsService.createBookingNotification(
        userId,
        'booking_updated',
        booking._id.toString(),
        `Votre réservation pour ${destinationName} a été mise à jour.`,
        {
          confirmationNumber: booking.confirmation_number,
          totalPrice: booking.total_price,
          tripDetails: booking.trip_details,
        },
      );
    }

    return booking;
  }

  async cancel(userId: string, bookingId: string) {
    const booking = await this.bookingModel
      .findOneAndUpdate(
        {
          _id: this.toObjectId(bookingId, 'booking id'),
          user_id: this.toObjectId(userId, 'user id'),
        },
        { $set: { status: BookingStatus.CANCELLED } },
        { new: true },
      )
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Send notification for cancelled booking
    // The createBookingNotification method now has permanent deduplication,
    // so it won't create duplicate notifications even if cancel() is called multiple times
    const destinationName =
      booking.trip_details?.destination ||
      booking.trip_details?.origin ||
      'votre destination';

    // CRITICAL: Check if notification already exists before attempting to create
    // This prevents unnecessary calls to createNotification
    try {
      const existingNotification =
        await this.notificationsService.findExistingNotification(
          userId,
          'booking_cancelled',
          booking._id.toString(),
        );

      if (existingNotification) {
        this.logger.warn(
          `Cancellation notification already exists for booking ${booking._id.toString()}. Skipping creation.`,
        );
        return booking;
      }
    } catch (error: any) {
      // If check fails, continue with creation attempt
      this.logger.debug(
        `Could not check for existing notification, proceeding with creation: ${error.message}`,
      );
    }

    try {
      await this.notificationsService.createBookingNotification(
        userId,
        'booking_cancelled',
        booking._id.toString(),
        `Votre réservation pour ${destinationName} a été annulée. Numéro de confirmation: ${booking.confirmation_number}`,
        {
          confirmationNumber: booking.confirmation_number,
          totalPrice: booking.total_price,
          tripDetails: booking.trip_details,
        },
      );
    } catch (error: any) {
      // If notification creation fails (e.g., booking doesn't exist or duplicate),
      // log but don't fail the cancellation
      this.logger.error(
        `Error creating cancellation notification: ${error.message}`,
        error.stack,
      );
    }

    return booking;
  }

  async delete(userId: string, bookingId: string): Promise<void> {
    const booking = await this.bookingModel
      .findOneAndDelete({
        _id: this.toObjectId(bookingId, 'booking id'),
        user_id: this.toObjectId(userId, 'user id'),
      })
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // CRITICAL: Delete all notifications related to this booking to prevent infinite loops
    // This ensures that deleted bookings don't trigger notifications anymore
    try {
      await this.notificationsService.deleteNotificationsByBookingId(
        userId,
        bookingId,
      );
      this.logger.log(`Deleted all notifications for booking ${bookingId}`);
    } catch (error: any) {
      // Log error but don't fail the deletion
      this.logger.error(
        `Error deleting notifications for booking ${bookingId}: ${error.message}`,
        error.stack,
      );
    }
    // No notification sent for deletion (different from cancellation)
  }
}
