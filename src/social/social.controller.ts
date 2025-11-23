import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SocialService } from './social.service';
import { FollowUserDto, ShareTripDto, UpdateSharedTripDto } from './social.dto';
import { ImgBBService } from '../journey/imgbb.service';

@Controller('social')
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly imgbbService: ImgBBService,
  ) {}

  // ========== FOLLOW/UNFOLLOW ==========

  @UseGuards(JwtAuthGuard)
  @Post('follow')
  async followUser(@Req() req: any, @Body() followUserDto: FollowUserDto) {
    return this.socialService.followUser(req.user.sub, followUserDto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfollow')
  async unfollowUser(@Req() req: any, @Body() followUserDto: FollowUserDto) {
    return this.socialService.unfollowUser(req.user.sub, followUserDto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('follow-status/:userId')
  async checkFollowStatus(@Req() req: any, @Param('userId') userId: string) {
    const isFollowing = await this.socialService.checkFollowStatus(req.user.sub, userId);
    return { isFollowing };
  }

  @UseGuards(JwtAuthGuard)
  @Get('followers')
  async getFollowers(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const followers = await this.socialService.getFollowers(
      req.user.sub,
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
    return followers;
  }

  @UseGuards(JwtAuthGuard)
  @Get('following')
  async getFollowing(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const following = await this.socialService.getFollowing(
      req.user.sub,
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
    return following;
  }

  @UseGuards(JwtAuthGuard)
  @Get('follow-counts')
  async getFollowCounts(@Req() req: any) {
    return this.socialService.getFollowCounts(req.user.sub);
  }

  @Get('follow-counts/:userId')
  async getFollowCountsByUserId(@Param('userId') userId: string) {
    return this.socialService.getFollowCounts(userId);
  }

  // ========== SHARED TRIPS ==========

  @UseGuards(JwtAuthGuard)
  @Post('share-trip')
  async shareTrip(@Req() req: any, @Body() shareTripDto: ShareTripDto) {
    const trip = await this.socialService.shareTrip(req.user.sub, shareTripDto);
    const tripObj = (trip as any).toObject ? (trip as any).toObject() : trip;
    return tripObj;
  }

  @UseGuards(JwtAuthGuard)
  @Put('share-trip/:id')
  async updateSharedTrip(
    @Req() req: any,
    @Param('id') tripId: string,
    @Body() updateDto: UpdateSharedTripDto,
  ) {
    const trip = await this.socialService.updateSharedTrip(req.user.sub, tripId, updateDto);
    const tripObj = (trip as any).toObject ? (trip as any).toObject() : trip;
    return tripObj;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('share-trip/:id')
  async deleteSharedTrip(@Req() req: any, @Param('id') tripId: string) {
    await this.socialService.deleteSharedTrip(req.user.sub, tripId);
    return { message: 'Shared trip deleted successfully' };
  }

  @Get('share-trip/:id')
  async getSharedTrip(@Req() req: any, @Param('id') tripId: string) {
    const viewerId = req.user?.sub; // Optional - may be null for public trips
    const trip = await this.socialService.getSharedTrip(tripId, viewerId);
    const tripObj = (trip as any).toObject ? (trip as any).toObject() : trip;
    return tripObj;
  }

  @Get('user/:userId/shared-trips')
  async getUserSharedTrips(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const trips = await this.socialService.getUserSharedTrips(
      userId,
      limit ? parseInt(limit, 10) : 20,
      skip ? parseInt(skip, 10) : 0,
    );
    return trips.map((trip) => {
      const tripObj = (trip as any).toObject ? (trip as any).toObject() : trip;
      return tripObj;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getSocialFeed(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const trips = await this.socialService.getSocialFeed(
      req.user.sub,
      limit ? parseInt(limit, 10) : 20,
      skip ? parseInt(skip, 10) : 0,
    );
    return trips.map((trip) => {
      const tripObj = (trip as any).toObject ? (trip as any).toObject() : trip;
      return tripObj;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('share-trip/:id/like')
  async likeSharedTrip(@Req() req: any, @Param('id') tripId: string) {
    return this.socialService.likeSharedTrip(req.user.sub, tripId);
  }
}

