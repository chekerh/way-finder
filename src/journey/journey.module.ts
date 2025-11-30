import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';
import { ImgBBService } from './imgbb.service';
import {
  Journey,
  JourneySchema,
  JourneyLike,
  JourneyLikeSchema,
  JourneyComment,
  JourneyCommentSchema,
} from './journey.schema';
import { BookingModule } from '../booking/booking.module';
import { VideoProcessingModule } from '../video-processing/video-processing.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserModule } from '../user/user.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Journey.name, schema: JourneySchema },
      { name: JourneyLike.name, schema: JourneyLikeSchema },
      { name: JourneyComment.name, schema: JourneyCommentSchema },
    ]),
    BookingModule,
    VideoProcessingModule,
    NotificationsModule,
    UserModule,
    RewardsModule,
    HttpModule,
  ],
  controllers: [JourneyController],
  providers: [JourneyService, ImgBBService],
  exports: [JourneyService, ImgBBService],
})
export class JourneyModule {}
