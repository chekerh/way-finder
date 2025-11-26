import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFollow, UserFollowSchema } from './social.schema';
import { SharedTrip, SharedTripSchema } from './social.schema';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { JourneyModule } from '../journey/journey.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: SharedTrip.name, schema: SharedTripSchema },
    ]),
    JourneyModule, // Import JourneyModule to access ImgBBService
  ],
  providers: [SocialService],
  controllers: [SocialController],
  exports: [SocialService],
})
export class SocialModule {}
