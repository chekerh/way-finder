import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoGenerationController } from './video-generation.controller';
import { VideoGenerationService } from './video-generation.service';
import { VideoCompositionService } from './video-composition.service';
import {
  VideoGeneration,
  VideoGenerationSchema,
} from './schemas/video-generation.schema';
import { MusicTrack, MusicTrackSchema } from './schemas/music-track.schema';
import { TravelPlan, TravelPlanSchema } from './schemas/travel-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoGeneration.name, schema: VideoGenerationSchema },
      { name: MusicTrack.name, schema: MusicTrackSchema },
      { name: TravelPlan.name, schema: TravelPlanSchema },
    ]),
  ],
  controllers: [VideoGenerationController],
  providers: [VideoGenerationService, VideoCompositionService],
  exports: [VideoGenerationService],
})
export class VideoGenerationModule {}
