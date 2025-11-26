import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, enum: ['user', 'assistant'], required: true })
  role: 'user' | 'assistant';

  @Prop({
    type: String,
    enum: ['huggingface', 'openai_gpt4o_mini', 'openai_gpt4o'],
    required: true,
  })
  model_used: string;

  @Prop({ type: Object, default: {} })
  metadata?: {
    flight_packs?: Array<{
      title: string;
      price: string;
      origin: string;
      destination: string;
      airline?: string;
      details?: string;
    }>;
    preferences_used?: any;
  };
}

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  user_id: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  session_id: string;

  @Prop({ type: [Types.ObjectId], ref: 'ChatMessage', default: [] })
  messages: Types.ObjectId[];

  @Prop({
    type: String,
    enum: ['huggingface', 'openai_gpt4o_mini', 'openai_gpt4o'],
    default: 'huggingface',
  })
  current_model: string;

  @Prop({ type: Object, default: {} })
  context: {
    user_preferences?: any;
    conversation_summary?: string;
  };
}

export type ChatMessageDocument = HydratedDocument<ChatMessage>;
export type ChatSessionDocument = HydratedDocument<ChatSession>;

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);
