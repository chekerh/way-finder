import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { AmadeusService } from './amadeus.service';
import { ActivitiesService } from './activities.service';
import { HotelsService } from './hotels.service';
import { UserModule } from '../user/user.module';
import { CacheModule } from '../common/cache/cache.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000, // Increased timeout for hotel searches
      maxRedirects: 3,
    }),
    UserModule,
    CacheModule,
  ],
  controllers: [CatalogController],
  providers: [CatalogService, AmadeusService, ActivitiesService, HotelsService],
  exports: [CatalogService, HotelsService],
})
export class CatalogModule {}
