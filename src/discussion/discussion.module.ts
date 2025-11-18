import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscussionController } from './discussion.controller';
import { DiscussionService } from './discussion.service';
import {
  DiscussionPost,
  DiscussionPostSchema,
  DiscussionComment,
  DiscussionCommentSchema,
} from './discussion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscussionPost.name, schema: DiscussionPostSchema },
      { name: DiscussionComment.name, schema: DiscussionCommentSchema },
    ]),
  ],
  controllers: [DiscussionController],
  providers: [DiscussionService],
  exports: [DiscussionService],
})
export class DiscussionModule {}

