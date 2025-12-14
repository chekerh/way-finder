import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './booking.schema';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { RewardsModule } from '../rewards/rewards.module';
import { UserModule } from '../user/user.module';
import { CommissionModule } from '../commission/commission.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    NotificationsModule,
    RewardsModule,
    UserModule,
    CommissionModule,
    AuthModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
