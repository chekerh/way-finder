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
export const DiscussionPostSchema = SchemaFactory.createForClass(DiscussionPost);

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
}

export type DiscussionCommentDocument = HydratedDocument<DiscussionComment>;
export const DiscussionCommentSchema = SchemaFactory.createForClass(DiscussionComment);

