import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelTipsController } from './travel-tips.controller';
import { TravelTipsService } from './travel-tips.service';
import { TravelTip, TravelTipSchema } from './travel-tips.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TravelTip.name, schema: TravelTipSchema }]),
  ],
  controllers: [TravelTipsController],
  providers: [TravelTipsService],
  exports: [TravelTipsService],
})
export class TravelTipsModule {}

