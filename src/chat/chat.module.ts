import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChatMessage,
  ChatSession,
  ChatMessageSchema,
  ChatSessionSchema,
} from './chat.schema';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MultiModelAIService } from './ai/multi-model-ai.service';
import { UserModule } from '../user/user.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatSession.name, schema: ChatSessionSchema },
    ]),
    UserModule,
    CatalogModule,
    HttpModule.register({
      timeout: 35000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, MultiModelAIService],
  exports: [ChatService],
})
export class ChatModule {}
