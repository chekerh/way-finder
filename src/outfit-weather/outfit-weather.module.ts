import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OutfitWeatherController } from './outfit-weather.controller';
import { OutfitWeatherService } from './outfit-weather.service';
import { OutfitSchema } from './outfit.schema';
import { WeatherService } from './weather.service';
import { ImageAnalysisService } from './image-analysis.service';
import { HttpModule } from '@nestjs/axios';
import { BookingModule } from '../booking/booking.module';
import { JourneyModule } from '../journey/journey.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Outfit', schema: OutfitSchema }]),
    HttpModule,
    ConfigModule,
    BookingModule,
    JourneyModule, // Pour accéder à ImgBBService
  ],
  controllers: [OutfitWeatherController],
  providers: [OutfitWeatherService, WeatherService, ImageAnalysisService],
  exports: [OutfitWeatherService],
})
export class OutfitWeatherModule {}

