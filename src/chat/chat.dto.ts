import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum ChatModel {
  HUGGINGFACE = 'huggingface',
  OPENAI_GPT4O_MINI = 'openai_gpt4o_mini',
  OPENAI_GPT4O = 'openai_gpt4o',
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(ChatModel)
  model?: ChatModel;
}

export class SwitchModelDto {
  @IsNotEmpty()
  @IsEnum(ChatModel)
  model: ChatModel;
}

export class ChatResponseDto {
  message: string;
  model_used: string;
  flight_packs?: Array<{
    title: string;
    price: string;
    origin: string;
    destination: string;
    airline?: string;
    details?: string;
  }>;
  session_id: string;
}
