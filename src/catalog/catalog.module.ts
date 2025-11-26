import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { AmadeusService } from './amadeus.service';
import { ActivitiesService } from './activities.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 3,
    }),
    UserModule,
  ],
  controllers: [CatalogController],
  providers: [CatalogService, AmadeusService, ActivitiesService],
  exports: [CatalogService],
})
export class CatalogModule {}
