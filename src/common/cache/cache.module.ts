import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Cache Module
 * Provides Redis-based caching functionality globally
 * Can be imported by any module that needs caching
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
