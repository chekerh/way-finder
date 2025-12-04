# Fix Google ID Index Issue

## Problem
MongoDB error: `E11000 duplicate key error collection: test.users index: google_id_1 dup key: { google_id: null }`

This happens because the `google_id` index was created without the `sparse: true` option, which means multiple users with `null` google_id values violate the unique constraint.

## Solution

The schema has been updated to explicitly create a sparse index. However, you need to drop the existing index and let MongoDB recreate it.

### Option 1: Automatic Fix (Recommended)
The schema now includes an explicit index definition. When you restart the backend, it will attempt to recreate the index. However, you may need to manually drop the old index first.

### Option 2: Manual Fix via MongoDB Shell/Compass

Connect to your MongoDB database and run:

```javascript
// Connect to your database
use test;  // or your database name

// Drop the existing non-sparse index
db.users.dropIndex("google_id_1");

// The index will be automatically recreated by Mongoose with sparse: true
// when the backend restarts
```

### Option 3: Fix via MongoDB Atlas (if using Atlas)

1. Go to MongoDB Atlas → Your Cluster → Collections
2. Select the `users` collection
3. Go to the "Indexes" tab
4. Find the `google_id_1` index
5. Click "Drop Index"
6. Restart your backend - the index will be recreated correctly

### Option 4: Fix via Render MongoDB (if using Render MongoDB)

If you're using Render's MongoDB service:

1. Connect to your MongoDB instance
2. Run the drop index command:
   ```javascript
   db.users.dropIndex("google_id_1");
   ```
3. Restart your backend service

## Verification

After fixing, try signing up a new user. The error should be gone.

To verify the index is sparse:
```javascript
db.users.getIndexes();
// Look for google_id_1 index with "sparse: true"
```

## Why This Happened

The `google_id` field was originally created with `unique: true` but without `sparse: true`. In MongoDB:
- A unique index without `sparse: true` treats `null` as a value, so only one document can have `null`
- A unique index with `sparse: true` ignores `null` values, allowing multiple documents to have `null`

Since regular email/password signups don't have a `google_id`, they all have `null`, which violates the non-sparse unique constraint.

