import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';
import { Journey, JourneySchema, JourneyLike, JourneyLikeSchema, JourneyComment, JourneyCommentSchema } from './journey.schema';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Journey.name, schema: JourneySchema },
      { name: JourneyLike.name, schema: JourneyLikeSchema },
      { name: JourneyComment.name, schema: JourneyCommentSchema },
    ]),
    BookingModule,
  ],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}

