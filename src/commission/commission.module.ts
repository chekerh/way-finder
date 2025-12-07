import { Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommissionSchema } from './commission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Commission', schema: CommissionSchema }]),
  ],
  providers: [CommissionService],
  controllers: [CommissionController],
  exports: [CommissionService],
})
export class CommissionModule {}

