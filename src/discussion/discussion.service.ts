import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DiscussionPost, DiscussionPostDocument } from './discussion.schema';
import { DiscussionComment, DiscussionCommentDocument } from './discussion.schema';
import { CreatePostDto, CreateCommentDto, UpdatePostDto } from './discussion.dto';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectModel(DiscussionPost.name)
    private readonly postModel: Model<DiscussionPostDocument>,
    @InjectModel(DiscussionComment.name)
    private readonly commentModel: Model<DiscussionCommentDocument>,
  ) {}

  async createPost(userId: string, dto: CreatePostDto) {
    const post = new this.postModel({
      user_id: this.toObjectId(userId, 'user id'),
      title: dto.title,
      content: dto.content,
      tags: dto.tags ?? [],
      destination: dto.destination,
      image_url: dto.image_url,
    });
    return post.save();
  }

  async getPosts(limit: number = 20, skip: number = 0, destination?: string) {
    const query: any = {};
    if (destination) {
      query.destination = destination;
    }

    const posts = await this.postModel
      .find(query)
      .populate('user_id', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.postModel.countDocuments(query).exec();

    return {
      posts,
      total,
      limit,
      skip,
    };
  }

  async getPost(postId: string) {
    const post = await this.postModel
      .findById(this.toObjectId(postId, 'post id'))
      .populate('user_id', 'username first_name last_name profile_image_url')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.postModel
      .findOneAndUpdate(
        {
          _id: this.toObjectId(postId, 'post id'),
          user_id: this.toObjectId(userId, 'user id'),
        },
        { $set: dto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found or you do not have permission to update it');
    }

    return post;
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.postModel
      .findOneAndDelete({
        _id: this.toObjectId(postId, 'post id'),
        user_id: this.toObjectId(userId, 'user id'),
      })
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found or you do not have permission to delete it');
    }

    // Delete all comments for this post
    await this.commentModel.deleteMany({ post_id: post._id }).exec();

    return { message: 'Post deleted successfully' };
  }

  async likePost(userId: string, postId: string) {
    const post = await this.postModel.findById(this.toObjectId(postId, 'post id')).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userIdObj = this.toObjectId(userId, 'user id');
    const isLiked = post.liked_by.some((id) => id.toString() === userIdObj.toString());

    if (isLiked) {
      // Unlike
      post.liked_by = post.liked_by.filter((id) => id.toString() !== userIdObj.toString());
      post.likes_count = Math.max(0, post.likes_count - 1);
    } else {
      // Like
      post.liked_by.push(userIdObj);
      post.likes_count += 1;
    }

    return post.save();
  }

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.postModel.findById(this.toObjectId(postId, 'post id')).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = new this.commentModel({
      user_id: this.toObjectId(userId, 'user id'),
      post_id: this.toObjectId(postId, 'post id'),
      content: dto.content,
    });

    const savedComment = await comment.save();

    // Update post comment count
    post.comments_count += 1;
    await post.save();

    return savedComment.populate('user_id', 'username first_name last_name profile_image_url');
  }

  async getComments(postId: string, limit: number = 50, skip: number = 0) {
    const comments = await this.commentModel
      .find({ post_id: this.toObjectId(postId, 'post id') })
      .populate('user_id', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.commentModel
      .countDocuments({ post_id: this.toObjectId(postId, 'post id') })
      .exec();

    return {
      comments,
      total,
      limit,
      skip,
    };
  }

  async likeComment(userId: string, commentId: string) {
    const comment = await this.commentModel.findById(this.toObjectId(commentId, 'comment id')).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userIdObj = this.toObjectId(userId, 'user id');
    const isLiked = comment.liked_by.some((id) => id.toString() === userIdObj.toString());

    if (isLiked) {
      comment.liked_by = comment.liked_by.filter((id) => id.toString() !== userIdObj.toString());
      comment.likes_count = Math.max(0, comment.likes_count - 1);
    } else {
      comment.liked_by.push(userIdObj);
      comment.likes_count += 1;
    }

    return comment.save();
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentModel
      .findOneAndDelete({
        _id: this.toObjectId(commentId, 'comment id'),
        user_id: this.toObjectId(userId, 'user id'),
      })
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found or you do not have permission to delete it');
    }

    // Update post comment count
    const post = await this.postModel.findById(comment.post_id).exec();
    if (post) {
      post.comments_count = Math.max(0, post.comments_count - 1);
      await post.save();
    }

    return { message: 'Comment deleted successfully' };
  }

  private toObjectId(id: string, label: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label} provided`);
    }
    return new Types.ObjectId(id);
  }
}

