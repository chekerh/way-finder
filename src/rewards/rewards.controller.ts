import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RewardsService } from './rewards.service';
import { RecalculatePointsService } from './recalculate-points.service';
import { AwardPointsDto, UserPointsResponse } from './rewards.dto';

@Controller('rewards')
export class RewardsController {
  constructor(
    private readonly rewardsService: RewardsService,
    private readonly recalculatePointsService: RecalculatePointsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('points')
  async getUserPoints(@Request() req): Promise<UserPointsResponse> {
    return this.rewardsService.getUserPoints(req.user.sub);
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
      userId: req.user.sub,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  async redeemPoints(
    @Request() req,
    @Body()
    body: {
      points: number;
      description: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.rewardsService.redeemPoints(
      req.user.sub,
      body.points,
      body.description,
      body.metadata,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('recalculate')
  async recalculatePoints(@Request() req) {
    // Recalculate points for the authenticated user
    await this.recalculatePointsService.recalculateUserPoints(req.user.sub);
    return {
      message: 'Points recalculated successfully',
      user_id: req.user.sub,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('recalculate-all')
  async recalculateAllPoints(@Request() req) {
    // Only allow admin users (you can add admin check here)
    // For now, allow any authenticated user to trigger this
    const result = await this.recalculatePointsService.recalculateAllUsers();
    return {
      message: 'Points recalculation completed',
      ...result,
    };
  }
}
