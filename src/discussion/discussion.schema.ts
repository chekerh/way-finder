import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DiscussionPost {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, default: null })
  destination?: string;

  @Prop({ type: Number, default: 0 })
  likes_count: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  liked_by: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  comments_count: number;

  @Prop({ type: String, default: null })
  image_url?: string;
}

export type DiscussionPostDocument = HydratedDocument<DiscussionPost>;
export const DiscussionPostSchema =
  SchemaFactory.createForClass(DiscussionPost);

/**
 * Database indexes for optimized query performance
 * - user_id index: Fast lookups for user's posts
 * - createdAt index: Enables efficient chronological sorting
 * - Compound index: Optimizes queries for user's posts sorted by date
 * - destination index: Enables filtering posts by destination
 */
DiscussionPostSchema.index({ user_id: 1, createdAt: -1 }); // User's posts sorted by date
DiscussionPostSchema.index({ createdAt: -1 }); // All posts sorted by date
DiscussionPostSchema.index({ destination: 1, createdAt: -1 }); // Destination-based queries

@Schema({ timestamps: true })
export class DiscussionComment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DiscussionPost', required: true })
  post_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: Number, default: 0 })
  likes_count: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  liked_by: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'DiscussionComment', default: null })
  parent_id?: Types.ObjectId;
}

export type DiscussionCommentDocument = HydratedDocument<DiscussionComment>;
export const DiscussionCommentSchema =
  SchemaFactory.createForClass(DiscussionComment);

/**
 * Database indexes for optimized query performance
 * - post_id index: Fast lookups for comments on a post
 * - user_id index: Efficient queries for user's comments
 * - Compound indexes: Optimize common query patterns
 */
DiscussionCommentSchema.index({ post_id: 1, createdAt: -1 }); // Comments for a post sorted by date
DiscussionCommentSchema.index({ user_id: 1, createdAt: -1 }); // User's comments sorted by date
DiscussionCommentSchema.index({ post_id: 1, parent_id: 1 }); // Nested comment queries
