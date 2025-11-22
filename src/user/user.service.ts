import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const created = new this.userModel(createUserDto);
    return await created.save();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ google_id: googleId }).exec();
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ email_verification_token: token }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async updateGoogleId(userId: string, googleId: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { google_id: googleId } },
        { new: true, runValidators: true }
      )
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async verifyEmail(userId: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { 
          $set: { 
            email_verified: true,
            email_verified_at: new Date(),
          },
          $unset: { email_verification_token: '' },
        },
        { new: true, runValidators: true }
      )
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async updateVerificationToken(userId: string, token: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { email_verification_token: token } },
        { new: true, runValidators: true }
      )
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatePayload: Partial<User> = { ...updateUserDto };

    if (updatePayload.email) {
      updatePayload.email = updatePayload.email.toLowerCase();
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: updatePayload }, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }
}
