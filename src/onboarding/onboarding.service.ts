import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OnboardingSession, OnboardingSessionDocument } from './onboarding.schema';
import { AnswerDto } from './onboarding.dto';
import { OnboardingAIService } from './ai/onboarding-ai.service';
import { UserService } from '../user/user.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(OnboardingSession.name)
    private readonly onboardingModel: Model<OnboardingSessionDocument>,
    private readonly aiService: OnboardingAIService,
    private readonly userService: UserService,
    private readonly http: HttpService,
  ) {}

  private readonly n8nBaseUrl = process.env.N8N_BASE_URL;

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

    return this.forwardToN8N(session);
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

    return this.forwardToN8N(session);
  }

  async completeOnboarding(userId: string, sessionId: string, providedPreferences?: any): Promise<any> {
    const session = await this.onboardingModel.findOne({
      user_id: new Types.ObjectId(userId),
      session_id: sessionId,
    }).exec();

    if (!session) {
      throw new NotFoundException('Onboarding session not found');
    }

    const preferences = providedPreferences ?? this.aiService.extractPreferences(session.answers);

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

    return this.forwardToN8N(session);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private async forwardToN8N(session: OnboardingSessionDocument) {
    const payload = {
      session_id: session.session_id,
      answers: session.answers,
    };

    if (!this.n8nBaseUrl) {
      throw new InternalServerErrorException('N8N_BASE_URL is not configured');
    }

    const url = `${this.n8nBaseUrl}/webhook/wayfinder/onboarding/next`;
    let response;

    try {
      const { data } = await firstValueFrom(this.http.post(url, payload));
      response = data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to contact onboarding brain');
    }

    if (response.completed) {
      await this.completeOnboarding(session.user_id.toString(), session.session_id, response.preferences);
      return response;
    }

    if (response.question?.id) {
      session.current_question_id = response.question.id;
      await session.save();
    }

    return response;
  }
}

