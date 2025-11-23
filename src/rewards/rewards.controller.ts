import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RewardsService } from './rewards.service';
import { AwardPointsDto, UserPointsResponse } from './rewards.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('points')
  async getUserPoints(@Request() req): Promise<UserPointsResponse> {
    return this.rewardsService.getUserPoints(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('award')
  async awardPoints(
    @Request() req,
    @Body() dto: Omit<AwardPointsDto, 'userId'>,
  ) {
    // Award points to the authenticated user
    return this.rewardsService.awardPoints({
      ...dto,
      userId: req.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  async redeemPoints(
    @Request() req,
    @Body() body: { points: number; description: string; metadata?: Record<string, any> },
  ) {
    return this.rewardsService.redeemPoints(
      req.user.userId,
      body.points,
      body.description,
      body.metadata,
    );
  }
}

