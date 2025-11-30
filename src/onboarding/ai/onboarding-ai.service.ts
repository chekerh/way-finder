import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { OnboardingSession } from '../onboarding.schema';
import { Question } from '../questions/question-templates';

@Injectable()
export class OnboardingAIService {
  private readonly logger = new Logger(OnboardingAIService.name);
  private openai: OpenAI | null = null;
  private readonly maxQuestions = Number(
    process.env.ONBOARDING_MAX_QUESTIONS ?? 5,
  );

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn(
        'OPENAI_API_KEY not set, AI question generation will be disabled',
      );
    }
  }

  /**
   * Generates the next contextual question based on previous answers
   * Uses AI to create questions that flow naturally and relate to previous responses
   */
  async generateNextQuestion(
    session: OnboardingSession,
  ): Promise<Question | null> {
    const answers = session.answers;
    const answeredIds = session.questions_answered;

    if (answeredIds.length >= this.maxQuestions) {
      this.logger.log(
        `Reached max question limit (${this.maxQuestions}), completing session.`,
      );
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

      // If AI couldn't generate a question, fall back to deterministic questions
      if (!question) {
        this.logger.warn(
          'AI did not return a question, using fallback question generator',
        );
        return this.generateFallbackQuestion(answeredIds);
      }

      const normalizedQuestion = this.normalizeQuestion(question, answeredIds);
      if (!normalizedQuestion) {
        return this.generateFallbackQuestion(answeredIds);
      }
      return normalizedQuestion;
    } catch (error) {
      this.logger.error('Failed to generate AI question, falling back', error);
      return this.generateFallbackQuestion(answeredIds);
    }
  }

  /**
   * Uses OpenAI to generate a contextual question based on conversation history
   */
  private async generateAIContextualQuestion(
    session: OnboardingSession,
  ): Promise<Question | null> {
    if (!this.openai) {
      return null;
    }

    const answers = session.answers;
    const conversationHistory = this.buildConversationHistory(answers);

    const systemPrompt = `You are an expert travel consultant helping a new user set up their WayFinder travel app preferences. 
You have ONLY 5 questions total to understand the user's complete travel profile. Each question must be strategic and extract maximum value.

CRITICAL STRATEGY - Question Priority Order (NEVER ask about budget directly):
1. First question: Travel style/personality (solo, couple, family, group) OR primary travel motivation (adventure, relaxation, culture, business)
2. Second question: Preferred destinations/regions OR activities/interests (multiple choice to capture many preferences at once)
3. Third question: Activities/interests OR destination preferences (whichever wasn't asked in Q2) - use multiple_choice to gather maximum data
4. Fourth question: Travel frequency/timing OR accommodation preferences OR climate preference
5. Fifth question: Trip duration OR group size OR travel timing (fill remaining gaps)

SMART BUDGET INFERENCE - DO NOT ASK ABOUT BUDGET DIRECTLY:
- Budget can be INFERRED from activities and destinations the user selects
- Luxury activities (spa, fine dining, private tours) = high budget
- Adventure activities (hiking, camping, backpacking) = mid to low budget
- Popular expensive destinations (Paris, Tokyo, Dubai) = mid to high budget
- Budget destinations (Southeast Asia, Eastern Europe) = low to mid budget
- Family travel often indicates mid-range budget
- Solo travel can vary but often mid-range
- Business travel = high budget
- The system will automatically infer budget from these selections, so NEVER waste a question asking about budget directly

GUIDELINES FOR MAXIMUM VALUE:
- Each question should reveal MULTIPLE insights about the user
- Use multiple_choice when possible to gather more data per question (preferred for activities, interests, destinations)
- Make questions comprehensive but not overwhelming (4-8 options for multiple_choice, 4-6 for single_choice)
- Ask questions that help predict: destinations they'll love, activities they'll enjoy, when they'll travel, who they travel with
- Build on previous answers to create a cohesive profile
- Make questions conversational, engaging, and easy to answer
- Each answer should help us understand: WHERE they want to go, WHAT they want to do, WHEN they travel, WHO they travel with
- Budget will be automatically inferred from their activity and destination choices

QUESTION QUALITY REQUIREMENTS:
- Questions must be specific enough to generate actionable recommendations
- Options should cover the full spectrum of possibilities
- Use clear, concise language (max 20 words for question text)
- Make sure each question adds unique value not covered by previous questions
- Prioritize questions that reveal multiple preferences at once (e.g., "What activities interest you?" reveals both interests AND budget level)

Question types you can use:
- single_choice: For mutually exclusive options (e.g., travel style, accommodation type)
- multiple_choice: For gathering multiple preferences at once (e.g., activities, interests, regions, destinations) - STRONGLY PREFERRED
- text: Only for truly open-ended questions (use sparingly, max 1 text question)

Return a JSON object with this structure:
{
  "id": "unique_question_id",
  "type": "single_choice" | "multiple_choice" | "text",
  "text": "Your strategic question here",
  "options": [{"value": "option1", "label": "Display Label 1"}, ...],
  "required": true,
  "min_selections": 1 (if multiple_choice),
  "max_selections": 5 (if multiple_choice - allow more selections to gather more data)
}`;

    const userPrompt = `Here's what the user has told us so far (Question ${session.questions_answered.length + 1} of 5):
${conversationHistory}

Based on this conversation and the strategic question order, what's the MOST VALUABLE next question to ask?
Remember: We only have ${5 - session.questions_answered.length} questions left. Make this question count!
- Extract maximum information from this single question
- Use multiple_choice if possible to gather multiple preferences
- Build naturally on what they've already shared
- Ensure this question fills a critical gap in understanding their travel profile`;

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
    if (
      (question.type === 'single_choice' ||
        question.type === 'multiple_choice') &&
      (!question.options || question.options.length === 0)
    ) {
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
   * Optimized for 5 questions with maximum information extraction
   */
  private generateFallbackQuestion(answeredIds: string[]): Question | null {
    if (answeredIds.length >= this.maxQuestions) {
      return null;
    }

    // Question 1: Travel style/personality (comprehensive)
    if (!answeredIds.includes('travel_type')) {
      return {
        id: 'travel_type',
        type: 'single_choice',
        text: 'What best describes your travel style?',
        options: [
          { value: 'solo', label: 'Solo Traveler' },
          { value: 'couple', label: 'Romantic Getaway' },
          { value: 'family', label: 'Family Trip' },
          { value: 'friends', label: 'Friends Group' },
          { value: 'business', label: 'Business Travel' },
          { value: 'adventure', label: 'Adventure Seeker' },
        ],
        required: true,
        priority: 1,
      };
    }

    // Question 2: Activities & Interests (multiple choice to gather maximum data)
    // This helps infer budget - luxury activities = high budget, budget activities = low budget
    if (!answeredIds.includes('interests')) {
      return {
        id: 'interests',
        type: 'multiple_choice',
        text: 'What activities and experiences interest you most? (Select all that apply)',
        options: [
          { value: 'sightseeing', label: 'Sightseeing & Landmarks' },
          { value: 'adventure_sports', label: 'Adventure Sports' },
          { value: 'relaxation', label: 'Relaxation & Spa' },
          { value: 'nightlife', label: 'Nightlife & Entertainment' },
          { value: 'culture', label: 'Culture & History' },
          { value: 'nature', label: 'Nature & Wildlife' },
          { value: 'food', label: 'Food & Dining' },
          { value: 'shopping', label: 'Shopping' },
          { value: 'beaches', label: 'Beaches & Water Activities' },
          { value: 'mountains', label: 'Mountains & Hiking' },
          { value: 'backpacking', label: 'Backpacking & Budget Travel' },
          { value: 'luxury', label: 'Luxury Experiences & Fine Dining' },
        ],
        required: true,
        priority: 2,
        min_selections: 1,
        max_selections: 6, // Allow more selections to gather comprehensive data
      };
    }

    // Question 3: Destination preferences (multiple choice for regions)
    // This also helps infer budget - expensive destinations = high budget, budget destinations = low budget
    if (!answeredIds.includes('destination_preferences')) {
      return {
        id: 'destination_preferences',
        type: 'multiple_choice',
        text: 'Which regions or types of destinations interest you? (Select all that apply)',
        options: [
          { value: 'europe', label: 'Europe' },
          { value: 'asia', label: 'Asia' },
          { value: 'americas', label: 'Americas (North & South)' },
          { value: 'africa', label: 'Africa' },
          { value: 'oceania', label: 'Oceania (Australia, Pacific)' },
          { value: 'middle_east', label: 'Middle East' },
          { value: 'tropical', label: 'Tropical Islands' },
          { value: 'urban', label: 'Major Cities' },
          { value: 'rural', label: 'Countryside & Nature' },
        ],
        required: true,
        priority: 3,
        min_selections: 1,
        max_selections: 5,
      };
    }

    // Question 4: Travel frequency or accommodation preference
    if (
      !answeredIds.includes('travel_frequency') &&
      !answeredIds.includes('accommodation_preference')
    ) {
      // Prefer travel frequency as it helps with timing recommendations
      return {
        id: 'travel_frequency',
        type: 'single_choice',
        text: 'How often do you typically travel?',
        options: [
          { value: 'rarely', label: 'Rarely (once a year or less)' },
          { value: 'occasionally', label: 'Occasionally (2-3 times a year)' },
          { value: 'frequently', label: 'Frequently (4-6 times a year)' },
          {
            value: 'very_frequently',
            label: 'Very Frequently (7+ times a year)',
          },
        ],
        required: true,
        priority: 4,
      };
    }

    // Question 5: Climate preference or trip duration (final question)
    if (
      !answeredIds.includes('climate_preference') &&
      !answeredIds.includes('duration_preference')
    ) {
      return {
        id: 'climate_preference',
        type: 'single_choice',
        text: 'What climate do you prefer for travel?',
        options: [
          { value: 'tropical', label: 'Tropical & Warm' },
          { value: 'temperate', label: 'Temperate & Mild' },
          { value: 'cold', label: 'Cold & Snowy' },
          { value: 'any', label: 'Any Climate' },
        ],
        required: true,
        priority: 5,
      };
    }

    return null;
  }

  private normalizeQuestion(
    question: Question,
    answeredIds: string[],
  ): Question | null {
    const normalizedQuestion: Question = {
      ...question,
      id: question.id || `question_${Date.now()}`,
      required: question.required ?? true,
    };

    const canonicalId = this.detectCanonicalId(question);
    if (canonicalId) {
      normalizedQuestion.id = canonicalId;
    }

    // Avoid repeating identical questions
    if (answeredIds.includes(normalizedQuestion.id)) {
      this.logger.warn(
        `AI returned duplicate question "${normalizedQuestion.id}", switching to fallback`,
      );
      return null;
    }

    if (normalizedQuestion.type === 'multiple_choice') {
      const options =
        normalizedQuestion.options?.filter((opt) => !!opt?.label) ?? [];
      normalizedQuestion.options = options.slice(0, 6);
      if (!normalizedQuestion.min_selections) {
        normalizedQuestion.min_selections = 1;
      }
      if (!normalizedQuestion.max_selections) {
        normalizedQuestion.max_selections = Math.min(
          5,
          normalizedQuestion.options.length || 5,
        );
      }
    }

    return normalizedQuestion;
  }

  private detectCanonicalId(question: Question): string | null {
    const questionText = question.text?.toLowerCase() ?? '';
    const optionsText = (question.options ?? [])
      .map((option) => `${option.label} ${option.value}`.toLowerCase())
      .join(' ');
    const haystack = `${questionText} ${optionsText}`;

    const categoryKeywords: Record<string, string[]> = {
      travel_type: [
        'travel style',
        'travel personality',
        'type of trip',
        'who do you travel',
        'companions',
        'solo',
        'family',
        'couple',
        'friends',
        'group',
      ],
      budget: ['budget', 'spend', 'price', 'cost', '$', '€'],
      interests: [
        'interest',
        'activities',
        'experiences',
        'what do you enjoy',
        'favorite activities',
        'hobbies',
      ],
      destination_preferences: [
        'destination',
        'region',
        'place to go',
        'where do you want to go',
        'cities',
        'regions',
        'environment',
      ],
      accommodation_preference: [
        'accommodation',
        'stay',
        'hotel',
        'airbnb',
        'lodging',
        'where do you stay',
      ],
      travel_frequency: [
        'how often',
        'frequency',
        'times per year',
        'travel frequency',
      ],
      climate_preference: ['climate', 'weather', 'temperature', 'season'],
      duration_preference: ['how long', 'trip length', 'duration', 'stay for'],
      group_size: ['how many people', 'group size', 'with whom'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => haystack.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  hasEnoughData(answers: Record<string, any>): boolean {
    // With only 5 questions, we need to ensure we have comprehensive data
    // Count meaningful answers (arrays count as 1, but we check if they have items)
    const meaningfulAnswers = Object.values(answers).filter(
      (v) =>
        v !== null &&
        v !== undefined &&
        (Array.isArray(v) ? v.length > 0 : true),
    );

    // If we have 5 questions answered, we have enough data
    // Also check if we have key preferences: travel style, budget, interests, or destinations
    const hasKeyPreferences =
      answers.travel_type ||
      answers.budget ||
      (Array.isArray(answers.interests) && answers.interests.length > 0) ||
      (Array.isArray(answers.destination_preferences) &&
        answers.destination_preferences.length > 0);

    return meaningfulAnswers.length >= 4 && hasKeyPreferences; // At least 4 answers with key preferences
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
    
    // Smart budget inference - infer from activities and destinations if not explicitly provided
    if (answers.budget) {
      preferences.budget = answers.budget;
    } else {
      const inferredBudget = this.inferBudgetFromPreferences(answers);
      if (inferredBudget) {
        preferences.budget = inferredBudget;
        this.logger.log(`Inferred budget: ${inferredBudget} from user preferences`);
      }
    }
    
    if (answers.interests) {
      preferences.interests = Array.isArray(answers.interests)
        ? answers.interests
        : [answers.interests];
    }

    return preferences;
  }

  /**
   * Infers budget level from user's activity and destination preferences
   * This allows us to avoid asking about budget directly
   */
  private inferBudgetFromPreferences(answers: Record<string, any>): string | null {
    const activities = Array.isArray(answers.interests) 
      ? answers.interests 
      : answers.interests ? [answers.interests] : [];
    
    const destinations = Array.isArray(answers.destination_preferences)
      ? answers.destination_preferences
      : answers.destination_preferences ? [answers.destination_preferences] : [];
    
    const travelType = answers.travel_type;

    // Luxury indicators (high budget)
    const luxuryActivities = [
      'spa', 'relaxation', 'fine_dining', 'luxury', 'shopping', 
      'private_tours', 'cruise', 'resort', 'beach_resort'
    ];
    const luxuryDestinations = [
      'dubai', 'monaco', 'switzerland', 'paris', 'tokyo', 'singapore',
      'maldives', 'seychelles', 'bora_bora', 'saint_tropez', 'monte_carlo'
    ];

    // Budget indicators (low budget)
    const budgetActivities = [
      'backpacking', 'camping', 'hostel', 'hiking', 'budget_travel',
      'street_food', 'local_experiences', 'public_transport'
    ];
    const budgetDestinations = [
      'southeast_asia', 'eastern_europe', 'central_america', 'india',
      'nepal', 'vietnam', 'thailand', 'cambodia', 'laos', 'myanmar'
    ];

    // Check for luxury indicators
    const hasLuxuryActivity = activities.some(a => 
      luxuryActivities.some(la => String(a).toLowerCase().includes(la))
    );
    const hasLuxuryDestination = destinations.some(d =>
      luxuryDestinations.some(ld => String(d).toLowerCase().includes(ld))
    );
    const isBusinessTravel = travelType === 'business';

    // Check for budget indicators
    const hasBudgetActivity = activities.some(a =>
      budgetActivities.some(ba => String(a).toLowerCase().includes(ba))
    );
    const hasBudgetDestination = destinations.some(d =>
      budgetDestinations.some(bd => String(d).toLowerCase().includes(bd))
    );

    // Infer budget level
    if (hasLuxuryActivity || hasLuxuryDestination || isBusinessTravel) {
      return 'high'; // or 'luxury' if multiple luxury indicators
    }
    if (hasBudgetActivity || hasBudgetDestination) {
      return 'low';
    }
    
    // Default to mid-range if we have some preferences but no clear indicators
    if (activities.length > 0 || destinations.length > 0) {
      return 'mid_range';
    }

    return null; // Can't infer without enough data
  }
}
