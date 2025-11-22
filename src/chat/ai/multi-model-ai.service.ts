import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import OpenAI from 'openai';
import { firstValueFrom } from 'rxjs';
import { ChatModel } from '../chat.dto';

@Injectable()
export class MultiModelAIService {
  private readonly logger = new Logger(MultiModelAIService.name);
  private openai: OpenAI | null = null;
  private readonly huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
  private readonly huggingFaceModel = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

  constructor(private readonly http: HttpService) {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.logger.log('OpenAI client initialized for chat');
    } else {
      this.logger.warn('OPENAI_API_KEY not set, OpenAI models will be unavailable');
    }

    if (this.huggingFaceApiKey) {
      this.logger.log('Hugging Face API key configured');
    } else {
      this.logger.warn('HUGGINGFACE_API_KEY not set, Hugging Face model will be unavailable');
    }
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    userPreferences: any,
    model: ChatModel,
  ): Promise<{ response: string; flightPacks?: any[] }> {
    const systemPrompt = this.buildSystemPrompt(userPreferences);

    switch (model) {
      case ChatModel.HUGGINGFACE:
        return this.generateHuggingFaceResponse(userMessage, conversationHistory, systemPrompt, userPreferences);
      case ChatModel.OPENAI_GPT4O_MINI:
        return this.generateOpenAIResponse(userMessage, conversationHistory, systemPrompt, userPreferences, 'gpt-4o-mini');
      case ChatModel.OPENAI_GPT4O:
        return this.generateOpenAIResponse(userMessage, conversationHistory, systemPrompt, userPreferences, 'gpt-4o');
      default:
        throw new Error(`Unknown model: ${model}`);
    }
  }

  private buildSystemPrompt(userPreferences: any): string {
    const prefs = userPreferences || {};
    const interests = Array.isArray(prefs.interests) ? prefs.interests.join(', ') : 'general travel';
    const budget = prefs.budget || 'mid-range';
    const travelType = prefs.travel_type || 'leisure';
    const destinations = Array.isArray(prefs.destination_preferences) 
      ? prefs.destination_preferences.join(', ') 
      : 'various destinations';

    return `You are a helpful travel assistant for WayFinder. Your role is to help users find the perfect travel packages (flights, hotels, activities) based on their preferences.

USER PREFERENCES:
- Travel Type: ${travelType}
- Budget: ${budget}
- Interests: ${interests}
- Preferred Destinations: ${destinations}
- Group Size: ${prefs.group_size || 'not specified'}
- Climate Preference: ${prefs.climate_preference || 'not specified'}
- Duration: ${prefs.duration_preference || 'not specified'}

GUIDELINES:
1. When users ask about flights or travel packages, propose 2-3 specific flight packs
2. Each pack should include: origin → destination, airline, price in TND (Tunisian Dinar)
3. Base your recommendations on their preferences (budget, interests, destinations)
4. Be conversational, friendly, and helpful
5. If they ask general questions, answer naturally
6. Always format flight packs as: "Pack X: [Origin] → [Destination] - [Airline] - [Price] TND"
7. Include brief details about why each pack matches their preferences

IMPORTANT: When proposing flight packs, return them in a structured format that can be parsed.`;
  }

  private async generateHuggingFaceResponse(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt: string,
    userPreferences: any,
  ): Promise<{ response: string; flightPacks?: any[] }> {
    if (!this.huggingFaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      // Build conversation context
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Last 10 messages for context
        { role: 'user', content: userMessage },
      ];

      const prompt = this.formatHuggingFacePrompt(messages);

      const response = await firstValueFrom(
        this.http.post(
          `https://api-inference.huggingface.co/models/${this.huggingFaceModel}`,
          { inputs: prompt },
          {
            headers: {
              Authorization: `Bearer ${this.huggingFaceApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      let generatedText = response.data[0]?.generated_text || '';
      
      // Extract the assistant's response (remove the prompt)
      if (generatedText.includes(prompt)) {
        generatedText = generatedText.split(prompt)[1]?.trim() || generatedText;
      }

      const flightPacks = this.extractFlightPacks(generatedText);
      
      return {
        response: generatedText.trim(),
        flightPacks,
      };
    } catch (error: any) {
      this.logger.error('Hugging Face API error', error?.response?.data || error.message);
      throw new Error('Failed to generate response from Hugging Face');
    }
  }

  private async generateOpenAIResponse(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt: string,
    userPreferences: any,
    model: string,
  ): Promise<{ response: string; flightPacks?: any[] }> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
      const flightPacks = this.extractFlightPacks(response);

      return {
        response: response.trim(),
        flightPacks,
      };
    } catch (error: any) {
      this.logger.error(`OpenAI ${model} API error`, error?.message);
      throw new Error(`Failed to generate response from ${model}`);
    }
  }

  private formatHuggingFacePrompt(messages: Array<{ role: string; content: string }>): string {
    // Format for Mistral instruct model
    let prompt = '<s>';
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `[INST] ${msg.content} [/INST]\n`;
      } else if (msg.role === 'user') {
        prompt += `[INST] ${msg.content} [/INST]\n`;
      } else {
        prompt += `${msg.content}</s>\n<s>`;
      }
    }
    return prompt;
  }

  private extractFlightPacks(text: string): any[] {
    const packs: any[] = [];
    const packRegex = /Pack\s+(\d+):\s*([^→]+)→\s*([^-]+)-\s*([^-]+)-\s*(\d+)\s*TND/gi;
    let match;

    while ((match = packRegex.exec(text)) !== null) {
      packs.push({
        title: `Pack ${match[1]}: ${match[2].trim()} → ${match[3].trim()} - ${match[4].trim()}`,
        price: `${match[5]} TND`,
        origin: match[2].trim(),
        destination: match[3].trim(),
        airline: match[4].trim(),
        details: `Flight from ${match[2].trim()} to ${match[3].trim()} with ${match[4].trim()}`,
      });
    }

    return packs;
  }

  isModelAvailable(model: ChatModel): boolean {
    switch (model) {
      case ChatModel.HUGGINGFACE:
        return !!this.huggingFaceApiKey;
      case ChatModel.OPENAI_GPT4O_MINI:
      case ChatModel.OPENAI_GPT4O:
        return !!this.openai;
      default:
        return false;
    }
  }
}

