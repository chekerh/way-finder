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
import { DiscussionService } from './discussion.service';
import { CreatePostDto, CreateCommentDto, UpdatePostDto } from './discussion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('discussion')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  async createPost(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.discussionService.createPost(req.user.sub, dto);
  }

  @Get('posts')
  async getPosts(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('destination') destination?: string,
  ) {
    return this.discussionService.getPosts(
      limit ? Number(limit) : 20,
      skip ? Number(skip) : 0,
      destination,
    );
  }

  @Get('posts/:id')
  async getPost(@Param('id') id: string) {
    return this.discussionService.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('posts/:id')
  async updatePost(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePostDto) {
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

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  async createComment(@Req() req: any, @Param('id') postId: string, @Body() dto: CreateCommentDto) {
    return this.discussionService.createComment(req.user.sub, postId, dto);
  }

  @Get('posts/:id/comments')
  async getComments(
    @Param('id') postId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.discussionService.getComments(postId, limit ? Number(limit) : 50, skip ? Number(skip) : 0);
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

