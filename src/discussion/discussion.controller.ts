import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DiscussionService } from './discussion.service';
import {
  CreatePostDto,
  CreateCommentDto,
  UpdatePostDto,
} from './discussion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  PaginationDto,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Discussion Controller
 * Handles forum posts, comments, likes, and discussion threads
 */
@Controller('discussion')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  /**
   * Create a new discussion post
   * Rate limited: 10 requests per minute to prevent spam
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('posts')
  async createPost(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.discussionService.createPost(req.user.sub, dto);
  }

  /**
   * Get discussion posts with pagination
   * @query destination - Filter by destination (optional)
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @Get('posts')
  async getPosts(
    @Query('destination') destination?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = pagination || {};
    const result = await this.discussionService.getPostsPaginated(
      page,
      limit,
      destination,
    );
    return createPaginatedResponse(result.data, result.total, page, limit);
  }

  @Get('posts/:id')
  async getPost(@Param('id') id: string) {
    return this.discussionService.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('posts/:id')
  async updatePost(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.discussionService.updatePost(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  async deletePost(@Req() req: any, @Param('id') id: string) {
    return this.discussionService.deletePost(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/like')
  async likePost(@Req() req: any, @Param('id') id: string) {
    return this.discussionService.likePost(req.user.sub, id);
  }

  /**
   * Create a comment on a post
   * Rate limited: 20 requests per minute to prevent spam
   */
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  async createComment(
    @Req() req: any,
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.discussionService.createComment(req.user.sub, postId, dto);
  }

  /**
   * Get comments for a post with pagination
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 50, max: 100)
   */
  @Get('posts/:id/comments')
  async getComments(
    @Param('id') postId: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 50 } = pagination || {};
    const result = await this.discussionService.getCommentsPaginated(
      postId,
      page,
      limit,
    );
    return createPaginatedResponse(result.data, result.total, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/:id/like')
  async likeComment(@Req() req: any, @Param('id') commentId: string) {
    return this.discussionService.likeComment(req.user.sub, commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  async deleteComment(@Req() req: any, @Param('id') commentId: string) {
    return this.discussionService.deleteComment(req.user.sub, commentId);
  }
}
