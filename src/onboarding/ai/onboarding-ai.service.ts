import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { OnboardingSession } from '../onboarding.schema';
import { Question } from '../questions/question-templates';

@Injectable()
export class OnboardingAIService {
  private readonly logger = new Logger(OnboardingAIService.name);
  private openai: OpenAI | null = null;
  private readonly maxQuestions = Number(process.env.ONBOARDING_MAX_QUESTIONS ?? 7);

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not set, AI question generation will be disabled');
    }
  }

  /**
   * Generates the next contextual question based on previous answers
   * Uses AI to create questions that flow naturally and relate to previous responses
   */
  async generateNextQuestion(session: OnboardingSession): Promise<Question | null> {
    const answers = session.answers;
    const answeredIds = session.questions_answered;

    if (answeredIds.length >= this.maxQuestions) {
      this.logger.log(`Reached max question limit (${this.maxQuestions}), completing session.`);
      return null;
    }

    // If no AI available, fall back to basic required questions
    if (!this.openai) {
      return this.generateFallbackQuestion(answeredIds);
    }

    // If we have enough information, complete onboarding
    if (this.hasEnoughData(answers)) {
      return null;
    }

    try {
      const question = await this.generateAIContextualQuestion(session);
      return question;
    } catch (error) {
      this.logger.error('Failed to generate AI question, falling back', error);
      return this.generateFallbackQuestion(answeredIds);
    }
  }

  /**
   * Uses OpenAI to generate a contextual question based on conversation history
   */
  private async generateAIContextualQuestion(session: OnboardingSession): Promise<Question | null> {
    if (!this.openai) {
      return null;
    }

    const answers = session.answers;
    const conversationHistory = this.buildConversationHistory(answers);
    
    const systemPrompt = `You are a helpful travel assistant helping a new user set up their WayFinder travel app preferences. 
Your goal is to ask ONE relevant, engaging question that naturally follows from their previous answers.

Guidelines:
- Ask questions that build on what they've already told you
- Make questions conversational and friendly
- Focus on travel preferences: destinations, activities, budget, accommodation, travel style, etc.
- Each question should help you understand their travel personality better
- Don't repeat information you already have
- Keep questions concise (max 15 words)
- Provide 3-6 answer options that are specific and useful

Question types you can use:
- single_choice: User picks one option
- multiple_choice: User can select multiple options (specify min/max)
- text: For open-ended responses (use sparingly)

Return a JSON object with this structure:
{
  "id": "unique_question_id",
  "type": "single_choice" | "multiple_choice" | "text",
  "text": "Your question here",
  "options": [{"value": "option1", "label": "Display Label 1"}, ...],
  "required": true/false,
  "min_selections": 1 (if multiple_choice),
  "max_selections": 3 (if multiple_choice)
}`;

    const userPrompt = `Here's what the user has told us so far:
${conversationHistory}

Based on this conversation, what's the most relevant next question to ask? 
Remember: make it flow naturally from what they've already shared.`;

    const completion = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseContent);
    
    // Validate and format the question
    const question: Question = {
      id: parsedResponse.id || `question_${Date.now()}`,
      type: parsedResponse.type || 'single_choice',
      text: parsedResponse.text,
      options: parsedResponse.options || [],
      required: parsedResponse.required !== false,
      priority: session.questions_answered.length + 1,
      min_selections: parsedResponse.min_selections,
      max_selections: parsedResponse.max_selections,
    };

    // Ensure we have valid options for choice questions
    if ((question.type === 'single_choice' || question.type === 'multiple_choice') && 
        (!question.options || question.options.length === 0)) {
      throw new Error('Choice questions must have options');
    }

    return question;
  }

  /**
   * Builds a natural conversation history from answers
   */
  private buildConversationHistory(answers: Record<string, any>): string {
    if (Object.keys(answers).length === 0) {
      return 'This is the first question. Start with something welcoming and broad about their travel interests.';
    }

    const history: string[] = [];
    
    for (const [key, value] of Object.entries(answers)) {
      if (value === null || value === undefined) continue;
      
      const questionText = this.getQuestionText(key);
      let answerText = '';
      
      if (Array.isArray(value)) {
        answerText = value.join(', ');
      } else if (typeof value === 'object') {
        answerText = JSON.stringify(value);
      } else {
        answerText = String(value);
      }
      
      history.push(`Q: ${questionText}\nA: ${answerText}`);
    }

    return history.join('\n\n');
    }

  /**
   * Gets human-readable question text for history
   */
  private getQuestionText(questionId: string): string {
    const questionMap: Record<string, string> = {
      travel_type: 'What type of trip are you planning?',
      budget: 'What is your budget range?',
      interests: 'What activities interest you?',
      accommodation_preference: 'What type of accommodation do you prefer?',
      destination_preferences: 'What type of destinations interest you?',
      group_size: 'How many people will be traveling?',
      travel_frequency: 'How often do you travel?',
      climate_preference: 'What climate do you prefer?',
      duration_preference: 'How long do you typically travel?',
    };
    
    return questionMap[questionId] || `Question about ${questionId}`;
    }

  /**
   * Fallback question generator when AI is unavailable
   */
  private generateFallbackQuestion(answeredIds: string[]): Question | null {
    if (answeredIds.length >= this.maxQuestions) {
      return null;
    }
    // Basic required questions
    if (!answeredIds.includes('travel_type')) {
      return {
        id: 'travel_type',
        type: 'single_choice',
        text: 'What type of trip are you planning?',
        options: [
          { value: 'business', label: 'Business' },
          { value: 'leisure', label: 'Leisure' },
          { value: 'adventure', label: 'Adventure' },
          { value: 'family', label: 'Family' },
          { value: 'solo', label: 'Solo Travel' },
          { value: 'couple', label: 'Romantic Getaway' },
        ],
        required: true,
        priority: 1,
      };
    }

    if (!answeredIds.includes('budget')) {
      return {
        id: 'budget',
        type: 'single_choice',
        text: 'What is your budget range?',
        options: [
          { value: 'low', label: 'Budget-friendly ($)' },
          { value: 'mid_range', label: 'Mid-range ($$)' },
          { value: 'high', label: 'High-end ($$$)' },
          { value: 'luxury', label: 'Luxury ($$$$)' },
        ],
        required: true,
        priority: 2,
      };
    }

    if (!answeredIds.includes('interests')) {
      return {
        id: 'interests',
        type: 'multiple_choice',
        text: 'What activities interest you? (Select all that apply)',
        options: [
          { value: 'sightseeing', label: 'Sightseeing & Landmarks' },
          { value: 'adventure_sports', label: 'Adventure Sports' },
          { value: 'relaxation', label: 'Relaxation & Spa' },
          { value: 'nightlife', label: 'Nightlife & Entertainment' },
          { value: 'culture', label: 'Culture & History' },
          { value: 'nature', label: 'Nature & Wildlife' },
          { value: 'food', label: 'Food & Dining' },
          { value: 'shopping', label: 'Shopping' },
        ],
        required: true,
        priority: 3,
        min_selections: 1,
        max_selections: 5,
      };
    }

    return null;
  }

  hasEnoughData(answers: Record<string, any>): boolean {
    // Require at least 5 meaningful answers for a good profile
    const meaningfulAnswers = Object.values(answers).filter(
      (v) => v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
    );
    
    return meaningfulAnswers.length >= 5;
  }

  extractPreferences(answers: Record<string, any>): any {
    const preferences: any = {};

    // Extract all answers into preferences
    for (const [key, value] of Object.entries(answers)) {
      if (value === null || value === undefined) continue;

      // Handle arrays
      if (Array.isArray(value)) {
        preferences[key] = value.length > 0 ? value : undefined;
      } else {
        preferences[key] = value;
      }
    }

    // Ensure standard fields exist
    if (answers.travel_type) {
      preferences.travel_type = answers.travel_type;
    }
    if (answers.budget) {
      preferences.budget = answers.budget;
    }
    if (answers.interests) {
      preferences.interests = Array.isArray(answers.interests) 
        ? answers.interests 
        : [answers.interests];
    }

    return preferences;
  }
}
