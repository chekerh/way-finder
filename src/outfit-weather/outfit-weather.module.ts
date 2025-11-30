import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OutfitWeatherController } from './outfit-weather.controller';
import { OutfitWeatherService } from './outfit-weather.service';
import { Outfit, OutfitSchema } from './outfit.schema';
import { WeatherService } from './weather.service';
import { ImageAnalysisService } from './image-analysis.service';
import { HttpModule } from '@nestjs/axios';
import { BookingModule } from '../booking/booking.module';
import { JourneyModule } from '../journey/journey.module';
import { RewardsModule } from '../rewards/rewards.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Outfit.name, schema: OutfitSchema }]),
    HttpModule.register({
      timeout: 30000, // 30 seconds timeout for HTTP requests
      maxRedirects: 3,
    }),
    ConfigModule,
    BookingModule,
    JourneyModule, // Pour accéder à ImgBBService
    RewardsModule,
    UserModule,
  ],
  controllers: [OutfitWeatherController],
  providers: [OutfitWeatherService, WeatherService, ImageAnalysisService],
  exports: [OutfitWeatherService],
})
export class OutfitWeatherModule {}

