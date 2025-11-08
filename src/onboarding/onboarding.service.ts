import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OnboardingSession, OnboardingSessionDocument } from './onboarding.schema';
import { AnswerDto } from './onboarding.dto';
import { OnboardingAIService } from './ai/onboarding-ai.service';
import { UserService } from '../user/user.service';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(OnboardingSession.name)
    private readonly onboardingModel: Model<OnboardingSessionDocument>,
    private readonly aiService: OnboardingAIService,
    private readonly userService: UserService,
  ) {}

  async startSession(userId: string): Promise<any> {
    // Check if user already has a session
    let session = await this.onboardingModel.findOne({ user_id: new Types.ObjectId(userId) }).exec();

    if (!session) {
      // Create new session
      const sessionId = this.generateSessionId();
      session = new this.onboardingModel({
        user_id: new Types.ObjectId(userId),
        session_id: sessionId,
        answers: {},
        questions_answered: [],
        completed: false,
      });
      await session.save();
    }

    // Check if already completed
    if (session.completed) {
      throw new BadRequestException('Onboarding already completed');
    }

    // Generate first/next question
    const question = this.aiService.generateNextQuestion(session);
    
    if (!question) {
      // Complete onboarding if no more questions
      return await this.completeOnboarding(userId, session.session_id);
    }

    // Update current question
    session.current_question_id = question.id;
    await session.save();

    return {
      session_id: session.session_id,
      question: question,
      progress: {
        current: session.questions_answered.length + 1,
        total: null, // Dynamic based on AI
      },
      completed: false,
    };
  }

  async submitAnswer(userId: string, dto: AnswerDto): Promise<any> {
    const session = await this.onboardingModel.findOne({
      user_id: new Types.ObjectId(userId),
      session_id: dto.session_id,
    }).exec();

    if (!session) {
      throw new NotFoundException('Onboarding session not found');
    }

    if (session.completed) {
      throw new BadRequestException('Onboarding already completed');
    }

    // Validate answer
    if (dto.question_id !== session.current_question_id) {
      throw new BadRequestException('Invalid question ID');
    }

    // Save answer
    session.answers[dto.question_id] = dto.answer;
    if (!session.questions_answered.includes(dto.question_id)) {
      session.questions_answered.push(dto.question_id);
    }

    // Generate next question
    const nextQuestion = this.aiService.generateNextQuestion(session);

    if (!nextQuestion) {
      // Complete onboarding
      return await this.completeOnboarding(userId, session.session_id);
    }

    // Update session
    session.current_question_id = nextQuestion.id;
    await session.save();

    return {
      session_id: session.session_id,
      question: nextQuestion,
      progress: {
        current: session.questions_answered.length + 1,
        total: null,
      },
      completed: false,
    };
  }

  async completeOnboarding(userId: string, sessionId: string): Promise<any> {
    const session = await this.onboardingModel.findOne({
      user_id: new Types.ObjectId(userId),
      session_id: sessionId,
    }).exec();

    if (!session) {
      throw new NotFoundException('Onboarding session not found');
    }

    // Extract preferences
    const preferences = this.aiService.extractPreferences(session.answers);

    // Update session
    session.completed = true;
    session.completed_at = new Date();
    session.extracted_preferences = preferences;
    await session.save();

    // Update user profile
    const userPreferencesArray = [
      ...(preferences.interests || []),
      ...(preferences.destination_preferences || []),
      preferences.travel_type,
      preferences.budget,
    ].filter(Boolean);

    await this.userService.updateProfile(userId, {
      preferences: userPreferencesArray,
      onboarding_completed: true,
      onboarding_completed_at: session.completed_at,
      onboarding_preferences: preferences,
    });

    return {
      session_id: session.session_id,
      completed: true,
      recommendations_generated: true,
      redirect_to: 'home',
      message: 'Onboarding completed! Your personalized recommendations are ready.',
    };
  }

  async getStatus(userId: string): Promise<any> {
    const session = await this.onboardingModel.findOne({
      user_id: new Types.ObjectId(userId),
    }).exec();

    const user = await this.userService.findById(userId);

    return {
      onboarding_completed: user?.onboarding_completed || false,
      session_id: session?.session_id || null,
      progress: {
        questions_answered: session?.questions_answered.length || 0,
        current_question_id: session?.current_question_id || null,
      },
      can_resume: session && !session.completed,
    };
  }

  async resumeSession(userId: string, sessionId?: string): Promise<any> {
    let session;
    
    if (sessionId) {
      session = await this.onboardingModel.findOne({
        user_id: new Types.ObjectId(userId),
        session_id: sessionId,
      }).exec();
    } else {
      session = await this.onboardingModel.findOne({
        user_id: new Types.ObjectId(userId),
      }).sort({ createdAt: -1 }).exec();
    }

    if (!session) {
      return this.startSession(userId);
    }

    if (session.completed) {
      throw new BadRequestException('Onboarding already completed');
    }

    // Get current or next question
    let question = this.aiService.generateNextQuestion(session);

    if (!question) {
      return await this.completeOnboarding(userId, session.session_id);
    }

    return {
      session_id: session.session_id,
      question: question,
      progress: {
        current: session.questions_answered.length + 1,
        total: null,
      },
      completed: false,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

