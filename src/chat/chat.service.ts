import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ChatMessage,
  ChatSession,
  ChatMessageDocument,
  ChatSessionDocument,
} from './chat.schema';
import {
  SendMessageDto,
  SwitchModelDto,
  ChatResponseDto,
  ChatModel,
} from './chat.dto';
import { MultiModelAIService } from './ai/multi-model-ai.service';
import { UserService } from '../user/user.service';
import { CatalogService } from '../catalog/catalog.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(ChatSession.name)
    private readonly chatSessionModel: Model<ChatSessionDocument>,
    private readonly aiService: MultiModelAIService,
    private readonly userService: UserService,
    private readonly catalogService: CatalogService,
  ) {}

  async sendMessage(
    userId: string,
    dto: SendMessageDto,
  ): Promise<ChatResponseDto> {
    // Get or create chat session
    let session: ChatSessionDocument | null = await this.chatSessionModel
      .findOne({ user_id: new Types.ObjectId(userId) })
      .exec();

    if (!session) {
      const newSession = await this.createSession(userId);
      if (!newSession) {
        throw new NotFoundException('Failed to create chat session');
      }
      session = newSession;
    }

    // Get user preferences
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userPreferences = (user as any).onboarding_preferences || {};

    // Use specified model or session's current model
    const model =
      dto.model ||
      (session.current_model as ChatModel) ||
      ChatModel.HUGGINGFACE;

    // Verify model is available
    if (!this.aiService.isModelAvailable(model)) {
      throw new ServiceUnavailableException(
        `Model ${model} is not available. Please check API keys.`,
      );
    }

    // Get conversation history
    const messageIds = session.messages || [];
    const previousMessages = await this.chatMessageModel
      .find({ _id: { $in: messageIds } })
      .sort({ createdAt: 1 })
      .limit(20)
      .exec();

    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.message,
    }));

    // Save user message
    const userMessage = new this.chatMessageModel({
      user_id: new Types.ObjectId(userId),
      message: dto.message,
      role: 'user',
      model_used: model,
    });
    await userMessage.save();

    // Generate AI response
    let aiResponse: { response: string; flightPacks?: any[] };
    try {
      aiResponse = await this.aiService.generateResponse(
        dto.message,
        conversationHistory,
        userPreferences,
        model,
      );
    } catch (error: any) {
      this.logger.error('AI generation failed', {
        error: error?.message,
        model,
        userId,
      });

      // Provide helpful fallback based on error type
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('loading')) {
        aiResponse = {
          response:
            'The AI model is currently loading. Please wait a moment and try again, or switch to a different model.',
        };
      } else if (
        errorMessage.includes('not available') ||
        errorMessage.includes('not configured')
      ) {
        aiResponse = {
          response:
            'This AI model is not available. Please switch to a different model using the settings icon.',
        };
      } else {
        // Generic fallback with helpful message
        aiResponse = {
          response:
            'I apologize, but I encountered an error processing your request. Please try again or switch to a different AI model. You can change models using the settings icon.',
        };
      }
    }

    // If user asked about flights and we got flight packs, enhance them with real data
    if (aiResponse.flightPacks && aiResponse.flightPacks.length > 0) {
      aiResponse.flightPacks = await this.enhanceFlightPacksWithRealData(
        aiResponse.flightPacks,
        userPreferences,
        userId,
      );
    } else if (this.isFlightRelatedQuery(dto.message)) {
      // User asked about flights but AI didn't generate packs, fetch real flights
      aiResponse.flightPacks = await this.fetchRealFlightPacks(
        userPreferences,
        userId,
      );
    }

    // Save AI response
    const assistantMessage = new this.chatMessageModel({
      user_id: new Types.ObjectId(userId),
      message: aiResponse.response,
      role: 'assistant',
      model_used: model,
      metadata: {
        flight_packs: aiResponse.flightPacks,
        preferences_used: userPreferences,
      },
    });
    await assistantMessage.save();

    // Update session
    session.messages.push(userMessage._id, assistantMessage._id);
    session.current_model = model;
    session.context = {
      user_preferences: userPreferences,
      conversation_summary: this.generateConversationSummary([
        ...conversationHistory,
        { role: 'user', content: dto.message },
        { role: 'assistant', content: aiResponse.response },
      ]),
    };
    await session.save();

    return {
      message: aiResponse.response,
      model_used: model,
      flight_packs: aiResponse.flightPacks,
      session_id: session.session_id,
    };
  }

  async switchModel(
    userId: string,
    dto: SwitchModelDto,
  ): Promise<{ success: boolean; model: string }> {
    const session = await this.chatSessionModel
      .findOne({ user_id: new Types.ObjectId(userId) })
      .exec();

    if (!session) {
      await this.createSession(userId);
    } else {
      if (!this.aiService.isModelAvailable(dto.model)) {
        throw new ServiceUnavailableException(
          `Model ${dto.model} is not available. Please check API keys.`,
        );
      }
      session.current_model = dto.model;
      await session.save();
    }

    return { success: true, model: dto.model };
  }

  /**
   * Get chat history (non-paginated - for backward compatibility)
   * @deprecated Use getHistoryPaginated instead for better performance
   */
  async getHistory(userId: string, limit: number = 50): Promise<any[]> {
    const session = await this.chatSessionModel
      .findOne({ user_id: new Types.ObjectId(userId) })
      .exec();

    if (!session || !session.messages.length) {
      return [];
    }

    const messages = await this.chatMessageModel
      .find({ _id: { $in: session.messages } })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();

    return messages.map((msg) => ({
      message: msg.message,
      role: msg.role,
      model_used: msg.model_used,
      flight_packs: msg.metadata?.flight_packs || [],
      created_at: (msg as any).createdAt,
    }));
  }

  /**
   * Get paginated chat history
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Paginated chat history results
   */
  async getHistoryPaginated(userId: string, page: number, limit: number) {
    const session = await this.chatSessionModel
      .findOne({ user_id: new Types.ObjectId(userId) })
      .exec();

    if (!session || !session.messages.length) {
      return { data: [], total: 0 };
    }

    const skip = (page - 1) * limit;
    const messageIds = session.messages;

    const [data, total] = await Promise.all([
      this.chatMessageModel
        .find({ _id: { $in: messageIds } })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.chatMessageModel.countDocuments({ _id: { $in: messageIds } }).exec(),
    ]);

    const transformedData = data.map((msg) => ({
      message: msg.message,
      role: msg.role,
      model_used: msg.model_used,
      flight_packs: msg.metadata?.flight_packs || [],
      created_at: (msg as any).createdAt,
    }));

    return { data: transformedData, total };
  }

  async clearHistory(userId: string): Promise<{ success: boolean }> {
    const session = await this.chatSessionModel
      .findOne({ user_id: new Types.ObjectId(userId) })
      .exec();

    if (session) {
      // Delete all messages
      await this.chatMessageModel
        .deleteMany({ user_id: new Types.ObjectId(userId) })
        .exec();
      // Reset session
      session.messages = [];
      session.context = {};
      await session.save();
    }

    return { success: true };
  }

  private async createSession(
    userId: string,
  ): Promise<ChatSessionDocument | null> {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const session = new this.chatSessionModel({
      user_id: new Types.ObjectId(userId),
      session_id: sessionId,
      messages: [],
      current_model: ChatModel.HUGGINGFACE,
      context: {},
    });
    return await session.save();
  }

  private isFlightRelatedQuery(message: string): boolean {
    const flightKeywords = [
      'flight',
      'fly',
      'ticket',
      'pack',
      'travel',
      'trip',
      'destination',
      'airline',
    ];
    const lowerMessage = message.toLowerCase();
    return flightKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  private async enhanceFlightPacksWithRealData(
    aiPacks: any[],
    preferences: any,
    userId?: string,
  ): Promise<any[]> {
    try {
      // Try to get real flights for the destinations mentioned
      const realFlights = await this.catalogService.getRecommendedFlights(
        userId || 'system',
        {
          maxResults: 5,
          ...preferences,
        },
      );

      if (realFlights?.data && realFlights.data.length > 0) {
        // Enhance AI packs with real flight data
        return aiPacks.map((pack, index) => {
          const realFlight = realFlights.data[index % realFlights.data.length];
          if (realFlight) {
            return {
              ...pack,
              price: `${Math.round(realFlight.price?.total || 0)} TND`,
              airline: realFlight.validatingAirlineCodes?.[0] || pack.airline,
              details: `Real-time flight: ${pack.details}`,
              real_flight_data: realFlight,
            };
          }
          return pack;
        });
      }
    } catch (error) {
      this.logger.warn('Failed to enhance with real flight data', error);
    }

    return aiPacks;
  }

  private async fetchRealFlightPacks(
    preferences: any,
    userId?: string,
  ): Promise<any[]> {
    try {
      const flights = await this.catalogService.getRecommendedFlights(
        userId || 'system',
        {
          maxResults: 3,
          ...preferences,
        },
      );

      if (flights?.data && flights.data.length > 0) {
        return flights.data.map((flight: any, index: number) => {
          const origin =
            flight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode ||
            'TUN';
          const destination =
            flight.itineraries?.[0]?.segments?.[
              flight.itineraries[0].segments.length - 1
            ]?.arrival?.iataCode || 'Unknown';
          const airline =
            flight.validatingAirlineCodes?.[0] || 'Various Airlines';
          const price = Math.round(flight.price?.total || 0);

          return {
            title: `Pack ${index + 1}: ${origin} → ${destination} - ${airline}`,
            price: `${price} TND`,
            origin,
            destination,
            airline,
            details: `Flight from ${origin} to ${destination} with ${airline}`,
            real_flight_data: flight,
          };
        });
      }
    } catch (error) {
      this.logger.warn('Failed to fetch real flights', error);
    }

    return [];
  }

  private generateConversationSummary(
    messages: Array<{ role: string; content: string }>,
  ): string {
    const recentMessages = messages.slice(-5);
    return recentMessages
      .map((msg) => `${msg.role}: ${msg.content.substring(0, 50)}...`)
      .join(' | ');
  }
}
