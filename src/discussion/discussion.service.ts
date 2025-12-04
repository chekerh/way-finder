import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DiscussionPost, DiscussionPostDocument } from './discussion.schema';
import {
  DiscussionComment,
  DiscussionCommentDocument,
} from './discussion.schema';
import {
  CreatePostDto,
  CreateCommentDto,
  UpdatePostDto,
} from './discussion.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UserService } from '../user/user.service';
import { RewardsService } from '../rewards/rewards.service';
import { PointsSource } from '../rewards/rewards.dto';

/**
 * Discussion Service
 * Handles forum posts, comments, likes, and discussion features
 * Includes notifications and reward points for user engagement
 */
@Injectable()
export class DiscussionService {
  private readonly logger = new Logger(DiscussionService.name);

  constructor(
    @InjectModel(DiscussionPost.name)
    private readonly postModel: Model<DiscussionPostDocument>,
    @InjectModel(DiscussionComment.name)
    private readonly commentModel: Model<DiscussionCommentDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly userService: UserService,
    private readonly rewardsService: RewardsService,
  ) {}

  /**
   * Create a new discussion post
   * Creates a post and populates user information for immediate display
   *
   * @param userId - ID of the user creating the post
   * @param dto - Post data containing title, content, tags, destination, image_url
   * @returns Created post document with populated user information
   * @throws BadRequestException if user ID is invalid
   *
   * @example
   * const post = await discussionService.createPost('user123', {
   *   title: 'Travel tips for Paris',
   *   content: 'Great places to visit...',
   *   tags: ['travel', 'paris'],
   *   destination: 'Paris'
   * });
   *
   * Note: User information is automatically populated for immediate display
   * Note: Tags and destination are optional fields
   */
  async createPost(userId: string, dto: CreatePostDto) {
    const post = new this.postModel({
      user_id: this.toObjectId(userId, 'user id'),
      title: dto.title,
      content: dto.content,
      tags: dto.tags ?? [],
      destination: dto.destination,
      image_url: dto.image_url,
    });
    const savedPost = await post.save();
    // Populate user_id before returning
    return savedPost.populate(
      'user_id',
      'username first_name last_name profile_image_url',
    );
  }

  /**
   * Get posts (non-paginated - for backward compatibility)
   * @deprecated Use getPostsPaginated instead for better performance
   */
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

  /**
   * Get paginated posts
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @param destination - Optional destination filter
   * @returns Paginated post results
   */
  async getPostsPaginated(page: number, limit: number, destination?: string) {
    const query: any = {};
    if (destination) {
      query.destination = destination;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .populate('user_id', 'username first_name last_name profile_image_url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  /**
   * Get a single discussion post by ID
   * Retrieves post with populated user information
   *
   * @param postId - ID of the post to retrieve
   * @returns Post document with populated user information
   * @throws NotFoundException if post doesn't exist
   *
   * @example
   * const post = await discussionService.getPost('post123');
   */
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

  /**
   * Update an existing discussion post
   * Only the post owner can update their posts
   *
   * @param userId - ID of the user updating the post (must be post owner)
   * @param postId - ID of the post to update
   * @param dto - Updated post data (title, content, tags, destination, image_url)
   * @returns Updated post document
   * @throws NotFoundException if post doesn't exist or user is not the owner
   *
   * @example
   * const updated = await discussionService.updatePost('user123', 'post123', {
   *   title: 'Updated title',
   *   content: 'Updated content'
   * });
   */
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
      throw new NotFoundException(
        'Post not found or you do not have permission to update it',
      );
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
      throw new NotFoundException(
        'Post not found or you do not have permission to delete it',
      );
    }

    // Delete all comments for this post
    await this.commentModel.deleteMany({ post_id: post._id }).exec();

    return { message: 'Post deleted successfully' };
  }

  async likePost(userId: string, postId: string) {
    const post = await this.postModel
      .findById(this.toObjectId(postId, 'post id'))
      .populate('user_id', 'username first_name last_name')
      .exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userIdObj = this.toObjectId(userId, 'user id');
    // Get post owner ID - handle both populated and non-populated cases
    const postOwnerId = (post.user_id as any)?._id
      ? (post.user_id as any)._id.toString()
      : post.user_id.toString();
    const isLiked = post.liked_by.some(
      (id) => id.toString() === userIdObj.toString(),
    );

    if (isLiked) {
      // Unlike
      post.liked_by = post.liked_by.filter(
        (id) => id.toString() !== userIdObj.toString(),
      );
      post.likes_count = Math.max(0, post.likes_count - 1);
    } else {
      // Like
      post.liked_by.push(userIdObj);
      post.likes_count += 1;

      // Send notification to post owner if it's not the same user
      if (postOwnerId !== userId) {
        try {
          const liker = await this.userService.findById(userId);
          const likerName = liker?.username || liker?.first_name || "Quelqu'un";
          this.logger.debug(
            `Creating like notification for post ${postId}: owner=${postOwnerId}, liker=${userId}`,
          );
          const notification =
            await this.notificationsService.createNotification(postOwnerId, {
              type: 'post_liked',
              title: 'Votre post a été aimé',
              message: `${likerName} a aimé votre post "${post.title.substring(0, 50)}${post.title.length > 50 ? '...' : ''}"`,
              data: { postId: postId, likerId: userId },
              actionUrl: `/post_detail/${postId}`,
            });
          this.logger.debug(
            `Notification created successfully: ${(notification as any)._id || 'unknown'}`,
          );
        } catch (error: any) {
          // Log error but don't fail the like operation
          this.logger.error(
            `Error sending like notification: ${error.message}`,
            error.stack,
          );
        }
      } else {
        this.logger.debug(
          `Skipping notification: user ${userId} liked their own post ${postId}`,
        );
      }
    }

    return post.save();
  }

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.postModel
      .findById(this.toObjectId(postId, 'post id'))
      .populate('user_id', 'username first_name last_name')
      .exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If parent_id is provided, verify the parent comment exists and belongs to the same post
    let parentComment: DiscussionCommentDocument | null = null;
    if (dto.parent_id) {
      parentComment = await this.commentModel
        .findById(this.toObjectId(dto.parent_id, 'parent comment id'))
        .exec();
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parentComment.post_id.toString() !== postId) {
        throw new BadRequestException(
          'Parent comment does not belong to this post',
        );
      }
    }

    const comment = new this.commentModel({
      user_id: this.toObjectId(userId, 'user id'),
      post_id: this.toObjectId(postId, 'post id'),
      content: dto.content,
      parent_id: dto.parent_id
        ? this.toObjectId(dto.parent_id, 'parent comment id')
        : undefined,
    });

    const savedComment = await comment.save();

    // Award points for publishing a comment (+10 points)
    try {
      const points = this.rewardsService.getPointsForAction(
        PointsSource.COMMENT,
      );
      await this.rewardsService.awardPoints({
        userId,
        points,
        source: PointsSource.COMMENT,
        description: 'Published a comment',
        metadata: {
          comment_id: savedComment._id.toString(),
          post_id: postId,
        },
      });
      this.logger.log(`Awarded ${points} points to user ${userId} for comment`);
    } catch (error: any) {
      this.logger.warn(`Failed to award points for comment: ${error.message}`);
      // Don't fail comment creation if points fail
    }

    // Update post comment count
    post.comments_count += 1;
    await post.save();

    // Send notification
    if (dto.parent_id && parentComment) {
      // This is a reply to a comment - notify the parent comment owner
      const parentCommentOwnerId = parentComment.user_id.toString();
      if (parentCommentOwnerId !== userId) {
        try {
          const replier = await this.userService.findById(userId);
          const replierName =
            replier?.username || replier?.first_name || "Quelqu'un";
          this.logger.debug(
            `Creating reply notification for comment ${dto.parent_id}: owner=${parentCommentOwnerId}, replier=${userId}`,
          );
          const notification =
            await this.notificationsService.createNotification(
              parentCommentOwnerId,
              {
                type: 'post_commented',
                title: 'Réponse à votre commentaire',
                message: `${replierName} a répondu à votre commentaire`,
                data: {
                  postId: postId,
                  commentId: savedComment._id.toString(),
                  parentCommentId: dto.parent_id,
                  commenterId: userId,
                },
                actionUrl: `/post_detail/${postId}`,
              },
            );
          this.logger.debug(
            `Reply notification created successfully: ${(notification as any)._id || 'unknown'}`,
          );
        } catch (error: any) {
          this.logger.error(
            `Error sending reply notification: ${error.message}`,
            error.stack,
          );
        }
      }
    } else {
      // This is a top-level comment - notify the post owner
      const postOwnerId = (post.user_id as any)?._id
        ? (post.user_id as any)._id.toString()
        : post.user_id.toString();
      if (postOwnerId !== userId) {
        try {
          const commenter = await this.userService.findById(userId);
          const commenterName =
            commenter?.username || commenter?.first_name || "Quelqu'un";
          this.logger.debug(
            `Creating comment notification for post ${postId}: owner=${postOwnerId}, commenter=${userId}`,
          );
          const notification =
            await this.notificationsService.createNotification(postOwnerId, {
              type: 'post_commented',
              title: 'Nouveau commentaire sur votre post',
              message: `${commenterName} a commenté votre post "${post.title.substring(0, 50)}${post.title.length > 50 ? '...' : ''}"`,
              data: {
                postId: postId,
                commentId: savedComment._id.toString(),
                commenterId: userId,
              },
              actionUrl: `/post_detail/${postId}`,
            });
          this.logger.debug(
            `Notification created successfully: ${(notification as any)._id || 'unknown'}`,
          );
        } catch (error: any) {
          this.logger.error(
            `Error sending comment notification: ${error.message}`,
            error.stack,
          );
        }
      }
    }

    return savedComment.populate(
      'user_id',
      'username first_name last_name profile_image_url',
    );
  }

  /**
   * Get comments for a post (non-paginated - for backward compatibility)
   * @deprecated Use getCommentsPaginated instead for better performance
   */
  async getComments(postId: string, limit: number = 50, skip: number = 0) {
    // Get top-level comments (no parent_id) and their replies
    const topLevelComments = await this.commentModel
      .find({
        post_id: this.toObjectId(postId, 'post id'),
        parent_id: { $exists: false },
      })
      .populate('user_id', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    // Get all replies for these top-level comments
    const topLevelCommentIds = topLevelComments.map((c) => c._id);
    const replies = await this.commentModel
      .find({
        post_id: this.toObjectId(postId, 'post id'),
        parent_id: { $in: topLevelCommentIds },
      })
      .populate('user_id', 'username first_name last_name profile_image_url')
      .sort({ createdAt: 1 }) // Oldest first for replies
      .exec();

    // Group replies by parent comment
    const repliesByParent = new Map();
    replies.forEach((reply) => {
      if (reply.parent_id) {
        const parentId = reply.parent_id.toString();
        if (!repliesByParent.has(parentId)) {
          repliesByParent.set(parentId, []);
        }
        repliesByParent.get(parentId).push(reply);
      }
    });

    // Attach replies to their parent comments
    const commentsWithReplies = topLevelComments.map((comment) => {
      const commentObj = comment.toObject
        ? comment.toObject()
        : JSON.parse(JSON.stringify(comment));
      commentObj.replies = repliesByParent.get(comment._id.toString()) || [];
      return commentObj;
    });

    const total = await this.commentModel
      .countDocuments({
        post_id: this.toObjectId(postId, 'post id'),
        parent_id: { $exists: false },
      })
      .exec();

    return {
      comments: commentsWithReplies,
      total,
      limit,
      skip,
    };
  }

  /**
   * Get paginated comments for a post
   * @param postId - Post ID
   * @param page - Page number (1-based)
   * @param limit - Items per page (top-level comments only)
   * @returns Paginated comment results (includes replies for each comment)
   */
  async getCommentsPaginated(postId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // Get top-level comments (no parent_id) and their replies
    const topLevelComments = await this.commentModel
      .find({
        post_id: this.toObjectId(postId, 'post id'),
        parent_id: { $exists: false },
      })
      .populate('user_id', 'username first_name last_name profile_image_url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get all replies for these top-level comments
    const topLevelCommentIds = topLevelComments.map((c) => c._id);
    const replies = await this.commentModel
      .find({
        post_id: this.toObjectId(postId, 'post id'),
        parent_id: { $in: topLevelCommentIds },
      })
      .populate('user_id', 'username first_name last_name profile_image_url')
      .sort({ createdAt: 1 }) // Oldest first for replies
      .exec();

    // Group replies by parent comment
    const repliesByParent = new Map();
    replies.forEach((reply) => {
      if (reply.parent_id) {
        const parentId = reply.parent_id.toString();
        if (!repliesByParent.has(parentId)) {
          repliesByParent.set(parentId, []);
        }
        repliesByParent.get(parentId).push(reply);
      }
    });

    // Attach replies to their parent comments
    const commentsWithReplies = topLevelComments.map((comment) => {
      const commentObj = comment.toObject
        ? comment.toObject()
        : JSON.parse(JSON.stringify(comment));
      commentObj.replies = repliesByParent.get(comment._id.toString()) || [];
      return commentObj;
    });

    const total = await this.commentModel
      .countDocuments({
        post_id: this.toObjectId(postId, 'post id'),
        parent_id: { $exists: false },
      })
      .exec();

    return { data: commentsWithReplies, total };
  }

  async likeComment(userId: string, commentId: string) {
    const comment = await this.commentModel
      .findById(this.toObjectId(commentId, 'comment id'))
      .exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userIdObj = this.toObjectId(userId, 'user id');
    const isLiked = comment.liked_by.some(
      (id) => id.toString() === userIdObj.toString(),
    );

    if (isLiked) {
      comment.liked_by = comment.liked_by.filter(
        (id) => id.toString() !== userIdObj.toString(),
      );
      comment.likes_count = Math.max(0, comment.likes_count - 1);
    } else {
      comment.liked_by.push(userIdObj);
      comment.likes_count += 1;
    }

    return comment.save();
  }

  async deleteComment(userId: string, commentId: string) {
    // First, find the comment to check permissions
    const comment = await this.commentModel
      .findById(this.toObjectId(commentId, 'comment id'))
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the comment owner OR the post owner
    const isCommentOwner = comment.user_id.toString() === userId;
    const post = await this.postModel.findById(comment.post_id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const isPostOwner = post.user_id.toString() === userId;

    if (!isCommentOwner && !isPostOwner) {
      throw new NotFoundException(
        'You do not have permission to delete this comment',
      );
    }

    // Delete the comment
    await this.commentModel.findByIdAndDelete(comment._id).exec();

    // Update post comment count
    post.comments_count = Math.max(0, post.comments_count - 1);
    await post.save();

    return { message: 'Comment deleted successfully' };
  }

  private toObjectId(id: string, label: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label} provided`);
    }
    return new Types.ObjectId(id);
  }
}
