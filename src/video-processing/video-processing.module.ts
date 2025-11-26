import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Journey, JourneySchema } from '../journey/journey.schema';
import { VideoProcessingService } from './video-processing.service';
import { VideoProcessingProcessor } from './video-processing.processor';
import { AiVideoService } from './ai-video.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-montage',
    }),
    MongooseModule.forFeature([{ name: Journey.name, schema: JourneySchema }]),
    HttpModule,
  ],
  providers: [VideoProcessingService, VideoProcessingProcessor, AiVideoService],
  exports: [VideoProcessingService, AiVideoService], // Export AiVideoService for use in other modules
})
export class VideoProcessingModule {}
