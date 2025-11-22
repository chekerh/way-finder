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
import { NotificationsModule } from '../notifications/notifications.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscussionPost.name, schema: DiscussionPostSchema },
      { name: DiscussionComment.name, schema: DiscussionCommentSchema },
    ]),
    NotificationsModule,
    UserModule,
  ],
  controllers: [DiscussionController],
  providers: [DiscussionService],
  exports: [DiscussionService],
})
export class DiscussionModule {}

