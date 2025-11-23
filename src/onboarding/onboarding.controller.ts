import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { AnswerDto, ResumeOnboardingDto } from './onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async start(@Req() req: any) {
    return this.onboardingService.startSession(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answer')
  async answer(@Req() req: any, @Body() dto: AnswerDto) {
    return this.onboardingService.submitAnswer(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async status(@Req() req: any) {
    return this.onboardingService.getStatus(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resume')
  async resume(@Req() req: any, @Body() dto: ResumeOnboardingDto) {
    return this.onboardingService.resumeSession(req.user.sub, dto.session_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('skip')
  async skip(@Req() req: any) {
    return this.onboardingService.skipOnboarding(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Req() req: any) {
    return this.onboardingService.resetOnboarding(req.user.sub);
  }
}

