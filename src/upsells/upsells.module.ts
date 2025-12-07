import { Module } from '@nestjs/common';
import { UpsellsController } from './upsells.controller';
import { UpsellsService } from './upsells.service';

@Module({
  controllers: [UpsellsController],
  providers: [UpsellsService],
  exports: [UpsellsService],
})
export class UpsellsModule {}

