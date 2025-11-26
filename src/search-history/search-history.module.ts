import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchHistory, SearchHistorySchema } from './search-history.schema';
import { SearchHistoryService } from './search-history.service';
import { SearchHistoryController } from './search-history.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SearchHistory.name, schema: SearchHistorySchema },
    ]),
  ],
  providers: [SearchHistoryService],
  controllers: [SearchHistoryController],
  exports: [SearchHistoryService],
})
export class SearchHistoryModule {}
