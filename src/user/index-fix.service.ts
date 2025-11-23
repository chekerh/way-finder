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

      // Always drop and recreate to ensure it's truly sparse
      // MongoDB sometimes reports index as sparse when it's not working correctly
      if (googleIdIndex) {
        this.logger.warn(
          '⚠️  Found google_id_1 index. Dropping it to ensure it\'s recreated with sparse: true...',
        );
        try {
          await collection.dropIndex('google_id_1');
          this.logger.log('✅ Dropped google_id_1 index.');
        } catch (dropError: any) {
          // If drop fails, try to continue anyway
          if (dropError.code === 27 || dropError.message?.includes('index not found')) {
            this.logger.log('Index already dropped or doesn\'t exist.');
          } else {
            this.logger.warn('Failed to drop index, will try to create anyway:', dropError.message);
          }
        }
      } else {
        this.logger.log('No google_id_1 index found. Creating new sparse index...');
      }

      // Check for existing users with null google_id before recreating index
      const usersWithNullGoogleId = await collection.countDocuments({ google_id: null });
      this.logger.log(`Found ${usersWithNullGoogleId} users with null google_id.`);

      // Force index recreation - create it explicitly with sparse: true
      this.logger.log('Creating google_id_1 index with unique: true, sparse: true...');
      try {
        await collection.createIndex({ google_id: 1 }, { unique: true, sparse: true });
        this.logger.log('✅ Created new sparse google_id_1 index.');
      } catch (createError: any) {
        // If creation fails due to duplicate null values, we need to handle it
        if (createError.code === 11000 && createError.message?.includes('null')) {
          this.logger.error('❌ Cannot create sparse index: duplicate null values exist.');
          this.logger.error('This should not happen with sparse index. Checking index status...');
          // Try to get more info
          const allIndexes = await collection.indexes();
          this.logger.error('All indexes:', JSON.stringify(allIndexes, null, 2));
        }
        throw createError;
      }
      
      // Verify it was created correctly
      const newIndexes = await collection.indexes();
      const newGoogleIdIndex = newIndexes.find((idx) => idx.name === 'google_id_1');
      if (newGoogleIdIndex) {
        if (newGoogleIdIndex.sparse) {
          this.logger.log('✅ Verified: google_id_1 index is now sparse and working correctly.');
        } else {
          this.logger.error('❌ ERROR: google_id_1 index was created but is NOT sparse!');
          this.logger.error('Index details:', JSON.stringify(newGoogleIdIndex, null, 2));
        }
      } else {
        this.logger.error('❌ ERROR: google_id_1 index was not created!');
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

