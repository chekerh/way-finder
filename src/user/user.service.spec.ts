import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserService } from './user.service';
import { User, UserDocument } from './user.schema';
import { createMockUser } from '../test/utils/test-utils';

describe('UserService', () => {
  let service: UserService;
  let userModel: jest.Mocked<Model<UserDocument>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const userId = 'user123';
      const mockUser = createMockUser({ _id: userId });

      (userModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById(userId);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'user123';

      (userModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 'user123';
      const updateDto = { first_name: 'Updated', last_name: 'Name' };
      const mockUser = createMockUser({ _id: userId, ...updateDto });

      (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.updateProfile(userId, updateDto);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });
});
