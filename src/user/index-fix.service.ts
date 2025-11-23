import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Service to fix the google_id index on application startup
 * Drops the old non-sparse index and lets Mongoose recreate it with sparse: true
 */
@Injectable()
export class IndexFixService implements OnModuleInit {
  private readonly logger = new Logger(IndexFixService.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    // Wait a bit for MongoDB connection to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    try {
      await this.fixGoogleIdIndex();
    } catch (error) {
      this.logger.error('Failed to fix google_id index', error);
      // Don't throw - allow app to start even if index fix fails
    }
  }

  private async fixGoogleIdIndex() {
    try {
      const db = this.connection.db;
      const collection = db.collection('users');

      // Get all indexes
      const indexes = await collection.indexes();
      const googleIdIndex = indexes.find((idx) => idx.name === 'google_id_1');

      if (!googleIdIndex) {
        this.logger.log('No google_id_1 index found. Mongoose will create it with sparse: true.');
        return;
      }

      // Check if index is already sparse
      if (googleIdIndex.sparse) {
        this.logger.log('✅ google_id_1 index is already sparse. No action needed.');
        return;
      }

      // Index exists but is not sparse - drop it
      this.logger.warn(
        '⚠️  Found non-sparse google_id_1 index. Dropping it to recreate with sparse: true...',
      );
      await collection.dropIndex('google_id_1');
      this.logger.log(
        '✅ Dropped old google_id_1 index. Mongoose will recreate it with sparse: true.',
      );

      // Force index recreation by calling ensureIndexes (Mongoose will use schema definition)
      // Note: The index will be created automatically on next user creation,
      // but we can trigger it explicitly
      await collection.createIndex({ google_id: 1 }, { unique: true, sparse: true });
      this.logger.log('✅ Created new sparse google_id_1 index.');
    } catch (error: any) {
      // If index doesn't exist, that's okay - Mongoose will create it
      if (error.code === 27 || error.message?.includes('index not found')) {
        this.logger.log('Index does not exist. Mongoose will create it with sparse: true.');
        return;
      }
      throw error;
    }
  }
}

