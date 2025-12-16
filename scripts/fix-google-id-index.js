/**
 * Migration script to fix google_id index
 * 
 * This script drops the existing non-sparse google_id index
 * and lets Mongoose recreate it with sparse: true on next app start
 * 
 * Run this once to fix the duplicate key error for null google_id values
 * 
 * Usage:
 *   node scripts/fix-google-id-index.js
 * 
 * Or via MongoDB shell:
 *   mongo <connection_string> scripts/fix-google-id-index.js
 */

const mongoose = require('mongoose');

// Get MongoDB URI from environment or use default
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wayfindr';

async function fixIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Check if index exists
    const indexes = await collection.indexes();
    const googleIdIndex = indexes.find(idx => idx.name === 'google_id_1');

    if (googleIdIndex) {
      console.log('Found existing google_id_1 index:', googleIdIndex);
      
      // Check if it's already sparse
      if (googleIdIndex.sparse) {
        console.log('✅ Index is already sparse. No action needed.');
      } else {
        console.log('⚠️  Index is not sparse. Dropping it...');
        await collection.dropIndex('google_id_1');
        console.log('✅ Index dropped. It will be recreated with sparse: true on next app start.');
      }
    } else {
      console.log('ℹ️  No existing google_id_1 index found. Mongoose will create it on next app start.');
    }

    // List all indexes
    console.log('\nCurrent indexes:');
    const allIndexes = await collection.indexes();
    allIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} (sparse: ${idx.sparse || false})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndex();

