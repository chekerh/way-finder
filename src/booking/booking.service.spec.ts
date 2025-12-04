import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { BookingService } from './booking.service';
import { Booking, BookingDocument } from './booking.schema';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { RewardsService } from '../rewards/rewards.service';
import { UserService } from '../user/user.service';
import { createMockBooking, createMockUser } from '../test/utils/test-utils';

describe('BookingService', () => {
  let service: BookingService;
  let bookingModel: jest.Mocked<Model<BookingDocument>>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let rewardsService: jest.Mocked<RewardsService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getModelToken(Booking.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
            deleteOne: jest.fn(),
            countDocuments: jest.fn(),
            aggregate: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
            sendNotification: jest.fn(),
          },
        },
        {
          provide: RewardsService,
          useValue: {
            addPoints: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingModel = module.get(getModelToken(Booking.name));
    notificationsService = module.get(NotificationsService);
    rewardsService = module.get(RewardsService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a booking successfully', async () => {
      const userId = 'user123';
      const createDto = {
        flight_details: {},
        passengers: [],
        total_price: 500,
        currency: 'EUR',
      };

      const mockBooking = createMockBooking({
        user_id: userId,
        ...createDto,
        status: BookingStatus.PENDING,
      });

      (bookingModel.create as jest.Mock).mockResolvedValue(mockBooking);
      (userService.findById as jest.Mock).mockResolvedValue(createMockUser());

      const result = await service.create(userId, createDto);

      expect(bookingModel.create).toHaveBeenCalledWith({
        user_id: userId,
        ...createDto,
        status: BookingStatus.PENDING,
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw BadRequestException if user not found', async () => {
      const userId = 'user123';
      (userService.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create(userId, {
          flight_details: {},
          passengers: [],
          total_price: 500,
          currency: 'EUR',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirm', () => {
    it('should confirm a booking and add rewards', async () => {
      const userId = 'user123';
      const bookingId = 'booking123';
      const mockBooking = createMockBooking({
        _id: bookingId,
        user_id: userId,
        status: BookingStatus.PENDING,
        total_price: 500,
      });

      (bookingModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooking),
      });

      (bookingModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockBooking,
          status: BookingStatus.CONFIRMED,
        }),
      });

      (rewardsService.addPoints as jest.Mock).mockResolvedValue({});

      const result = await service.confirm(userId, bookingId, {
        payment_id: 'payment123',
        payment_method: 'credit_card',
      });

      expect(bookingModel.findOneAndUpdate).toHaveBeenCalled();
      expect(rewardsService.addPoints).toHaveBeenCalled();
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should throw NotFoundException if booking not found', async () => {
      const userId = 'user123';
      const bookingId = 'booking123';

      (bookingModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.confirm(userId, bookingId, {
          payment_id: 'payment123',
          payment_method: 'credit_card',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('historyPaginated', () => {
    it('should return paginated booking history', async () => {
      const userId = 'user123';
      const page = 1;
      const limit = 10;

      const mockBookings = [createMockBooking({ user_id: userId })];

      (bookingModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockBookings),
      });

      (bookingModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await service.historyPaginated(userId, page, limit);

      expect(result.data).toEqual(mockBookings);
      expect(result.total).toBe(1);
      expect(bookingModel.find).toHaveBeenCalledWith({ user_id: userId });
    });
  });
});
