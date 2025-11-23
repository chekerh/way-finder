import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

/**
 * Service to fix the google_id index on application startup
 * Drops the old non-sparse index and lets Mongoose recreate it with sparse: true
 */
@Injectable()
export class IndexFixService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IndexFixService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onApplicationBootstrap() {
    // Wait a bit for MongoDB connection to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    try {
      await this.fixGoogleIdIndex();
    } catch (error) {
      this.logger.error('Failed to fix google_id index', error);
      // Don't throw - allow app to start even if index fix fails
    }
  }

  private async fixGoogleIdIndex() {
    try {
      const connection = this.userModel.db;
      const collection = connection.collection('users');

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

      // Force index recreation - create it explicitly with sparse: true
      await collection.createIndex({ google_id: 1 }, { unique: true, sparse: true });
      this.logger.log('✅ Created new sparse google_id_1 index.');
      
      // Verify it was created correctly
      const newIndexes = await collection.indexes();
      const newGoogleIdIndex = newIndexes.find((idx) => idx.name === 'google_id_1');
      if (newGoogleIdIndex?.sparse) {
        this.logger.log('✅ Verified: google_id_1 index is now sparse.');
      } else {
        this.logger.warn('⚠️  Warning: google_id_1 index may not be sparse. Please check manually.');
      }
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

