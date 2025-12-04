import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Recommendations Controller
 * Handles personalized travel recommendations based on user preferences
 */
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Get personalized recommendations for the authenticated user
   * @query type - Type of recommendations ('all', 'destinations', 'offers', 'activities')
   * @query limit - Maximum number of recommendations per category (default: 10)
   * @returns Personalized recommendations object with destinations, offers, and activities
   */
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

  /**
   * Regenerate personalized recommendations for the authenticated user
   * @returns Fresh personalized recommendations object
   */
  @UseGuards(JwtAuthGuard)
  @Get('regenerate')
  async regenerate(@Req() req: any) {
    return this.recommendationsService.generatePersonalizedRecommendations(
      req.user.sub,
    );
  }
}
