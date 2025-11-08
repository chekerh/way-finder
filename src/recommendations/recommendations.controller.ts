import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('personalized')
  async getPersonalized(
    @Req() req: any,
    @Query('type') type: string = 'all',
    @Query('limit') limit: string = '10',
  ) {
    const limitNum = parseInt(limit, 10) || 10;
    return this.recommendationsService.generatePersonalizedRecommendations(
      req.user.sub,
      type,
      limitNum,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('regenerate')
  async regenerate(@Req() req: any) {
    return this.recommendationsService.generatePersonalizedRecommendations(req.user.sub);
  }
}

