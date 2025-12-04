import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { AnswerDto, ResumeOnboardingDto } from './onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Onboarding Controller
 * Handles AI-driven dynamic onboarding flow for new users
 */
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Start a new onboarding session for the authenticated user
   * @returns Onboarding session with first question
   */
  @UseGuards(JwtAuthGuard)
  @Post('start')
  async start(@Req() req: any) {
    return this.onboardingService.startSession(req.user.sub);
  }

  /**
   * Submit an answer to the current onboarding question
   * @body AnswerDto - Answer data including question_id and answer
   * @returns Next question or completion status
   */
  @UseGuards(JwtAuthGuard)
  @Post('answer')
  async answer(@Req() req: any, @Body() dto: AnswerDto) {
    return this.onboardingService.submitAnswer(req.user.sub, dto);
  }

  /**
   * Get current onboarding status for the authenticated user
   * @returns Current onboarding status, progress, and session info
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async status(@Req() req: any) {
    return this.onboardingService.getStatus(req.user.sub);
  }

  /**
   * Resume an existing onboarding session
   * @body ResumeOnboardingDto - Session ID to resume
   * @returns Onboarding session with current question
   */
  @UseGuards(JwtAuthGuard)
  @Post('resume')
  async resume(@Req() req: any, @Body() dto: ResumeOnboardingDto) {
    return this.onboardingService.resumeSession(req.user.sub, dto.session_id);
  }

  /**
   * Skip the onboarding process for the authenticated user
   * Marks onboarding as completed without answering questions
   * @returns Completion status
   */
  @UseGuards(JwtAuthGuard)
  @Post('skip')
  async skip(@Req() req: any) {
    return this.onboardingService.skipOnboarding(req.user.sub);
  }

  /**
   * Reset onboarding for the authenticated user
   * Clears all onboarding data and starts fresh
   * @returns Reset confirmation and new session
   */
  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Req() req: any) {
    return this.onboardingService.resetOnboarding(req.user.sub);
  }
}
