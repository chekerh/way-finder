import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DiscussionPost, DiscussionPostDocument } from './discussion.schema';
import { DiscussionComment, DiscussionCommentDocument } from './discussion.schema';
import { CreatePostDto, CreateCommentDto, UpdatePostDto } from './discussion.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UserService } from '../user/user.service';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectModel(DiscussionPost.name)
    private readonly postModel: Model<DiscussionPostDocument>,
    @InjectModel(DiscussionComment.name)
    private readonly commentModel: Model<DiscussionCommentDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly userService: UserService,
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
    const post = await this.postModel.findById(this.toObjectId(postId, 'post id')).populate('user_id', 'username first_name last_name').exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userIdObj = this.toObjectId(userId, 'user id');
    // Get post owner ID - handle both populated and non-populated cases
    const postOwnerId = (post.user_id as any)?._id ? (post.user_id as any)._id.toString() : post.user_id.toString();
    const isLiked = post.liked_by.some((id) => id.toString() === userIdObj.toString());

    if (isLiked) {
      // Unlike
      post.liked_by = post.liked_by.filter((id) => id.toString() !== userIdObj.toString());
      post.likes_count = Math.max(0, post.likes_count - 1);
    } else {
      // Like
      post.liked_by.push(userIdObj);
      post.likes_count += 1;
      
      // Send notification to post owner if it's not the same user
      if (postOwnerId !== userId) {
        try {
          const liker = await this.userService.findById(userId);
          const likerName = liker?.username || liker?.first_name || 'Quelqu\'un';
          console.log(`[DiscussionService] Creating like notification for post ${postId}: owner=${postOwnerId}, liker=${userId}`);
          const notification = await this.notificationsService.createNotification(postOwnerId, {
            type: 'post_liked',
            title: 'Votre post a été aimé',
            message: `${likerName} a aimé votre post "${post.title.substring(0, 50)}${post.title.length > 50 ? '...' : ''}"`,
            data: { postId: postId, likerId: userId },
            actionUrl: `/post_detail/${postId}`,
          });
          console.log(`[DiscussionService] Notification created successfully: ${(notification as any)._id || 'unknown'}`);
        } catch (error) {
          // Log error but don't fail the like operation
          console.error('[DiscussionService] Error sending like notification:', error);
        }
      } else {
        console.log(`[DiscussionService] Skipping notification: user ${userId} liked their own post ${postId}`);
      }
    }

    return post.save();
  }

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.postModel.findById(this.toObjectId(postId, 'post id')).populate('user_id', 'username first_name last_name').exec();
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

    // Send notification to post owner if it's not the same user
    // Get post owner ID - handle both populated and non-populated cases
    const postOwnerId = (post.user_id as any)?._id ? (post.user_id as any)._id.toString() : post.user_id.toString();
    if (postOwnerId !== userId) {
      try {
        const commenter = await this.userService.findById(userId);
        const commenterName = commenter?.username || commenter?.first_name || 'Quelqu\'un';
        console.log(`[DiscussionService] Creating comment notification for post ${postId}: owner=${postOwnerId}, commenter=${userId}`);
        const notification = await this.notificationsService.createNotification(postOwnerId, {
          type: 'post_commented',
          title: 'Nouveau commentaire sur votre post',
          message: `${commenterName} a commenté votre post "${post.title.substring(0, 50)}${post.title.length > 50 ? '...' : ''}"`,
          data: { postId: postId, commentId: savedComment._id.toString(), commenterId: userId },
          actionUrl: `/post_detail/${postId}`,
        });
          console.log(`[DiscussionService] Notification created successfully: ${(notification as any)._id || 'unknown'}`);
      } catch (error) {
        // Log error but don't fail the comment operation
        console.error('[DiscussionService] Error sending comment notification:', error);
      }
    } else {
      console.log(`[DiscussionService] Skipping notification: user ${userId} commented on their own post ${postId}`);
    }

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

