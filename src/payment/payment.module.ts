import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.schema';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaypalService } from './paypal.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    NotificationsModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaypalService],
})
export class PaymentModule {}

