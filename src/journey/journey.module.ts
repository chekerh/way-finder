import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';
import { ImgBBService } from './imgbb.service';
import { Journey, JourneySchema, JourneyLike, JourneyLikeSchema, JourneyComment, JourneyCommentSchema } from './journey.schema';
import { BookingModule } from '../booking/booking.module';
import { VideoProcessingModule } from '../video-processing/video-processing.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Journey.name, schema: JourneySchema },
      { name: JourneyLike.name, schema: JourneyLikeSchema },
      { name: JourneyComment.name, schema: JourneyCommentSchema },
    ]),
    BookingModule,
    VideoProcessingModule,
    HttpModule,
  ],
  controllers: [JourneyController],
  providers: [JourneyService, ImgBBService],
  exports: [JourneyService],
})
export class JourneyModule {}

