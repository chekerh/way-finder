import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceAlert, PriceAlertSchema } from './price-alerts.schema';
import { PriceAlertsService } from './price-alerts.service';
import { PriceAlertsController } from './price-alerts.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceAlert.name, schema: PriceAlertSchema },
    ]),
    NotificationsModule,
  ],
  providers: [PriceAlertsService],
  controllers: [PriceAlertsController],
  exports: [PriceAlertsService],
})
export class PriceAlertsModule {}
