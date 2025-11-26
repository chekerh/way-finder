import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import {
  DestinationVideo,
  DestinationVideoSchema,
} from './destination-video.schema';
import { DestinationVideoService } from './destination-video.service';
import { DestinationVideoController } from './destination-video.controller';
import { ImageAggregatorService } from './image-aggregator.service';
import { MusicSelectorService } from './music-selector.service';
import { Journey, JourneySchema } from '../journey/journey.schema';
import { ImgBBService } from '../journey/imgbb.service';
import { VideoProcessingModule } from '../video-processing/video-processing.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DestinationVideo.name, schema: DestinationVideoSchema },
      { name: Journey.name, schema: JourneySchema },
    ]),
    HttpModule,
    VideoProcessingModule, // Import to access AiVideoService
  ],
  providers: [
    DestinationVideoService,
    ImageAggregatorService,
    MusicSelectorService,
    ImgBBService,
  ],
  controllers: [DestinationVideoController],
  exports: [DestinationVideoService],
})
export class DestinationVideoModule {}
