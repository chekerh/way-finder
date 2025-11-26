import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, SwitchModelDto, ChatModel } from './chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MultiModelAIService } from './ai/multi-model-ai.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiService: MultiModelAIService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('message')
  async sendMessage(@Req() req: any, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-model')
  async switchModel(@Req() req: any, @Body() dto: SwitchModelDto) {
    return this.chatService.switchModel(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.chatService.getHistory(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history')
  async clearHistory(@Req() req: any) {
    return this.chatService.clearHistory(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('models')
  async getAvailableModels(@Req() req: any) {
    return {
      models: [
        {
          id: ChatModel.HUGGINGFACE,
          name: 'Hugging Face (Free)',
          available: this.aiService.isModelAvailable(ChatModel.HUGGINGFACE),
        },
        {
          id: ChatModel.OPENAI_GPT4O_MINI,
          name: 'OpenAI GPT-4o Mini',
          available: this.aiService.isModelAvailable(
            ChatModel.OPENAI_GPT4O_MINI,
          ),
        },
        {
          id: ChatModel.OPENAI_GPT4O,
          name: 'OpenAI GPT-4o',
          available: this.aiService.isModelAvailable(ChatModel.OPENAI_GPT4O),
        },
      ],
    };
  }
}
