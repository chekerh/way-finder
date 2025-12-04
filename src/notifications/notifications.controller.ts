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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notifications.dto';
import {
  PaginationDto,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Notifications Controller
 * Handles user notifications, read/unread status, and notification management
 */
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(
    @Req() req: any,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    const notification = await this.notificationsService.createNotification(
      req.user.sub,
      createNotificationDto,
    );
    const notificationObj = (notification as any).toObject
      ? (notification as any).toObject()
      : notification;
    return notificationObj;
  }

  /**
   * Get user notifications with pagination
   * @query unreadOnly - Filter to unread notifications only (default: false)
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   */
  @Get()
  async getNotifications(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 20 } = pagination || {};
    const result =
      await this.notificationsService.getUserNotificationsPaginated(
        req.user.sub,
        unreadOnly === 'true',
        page,
        limit,
      );

    const data = result.data.map((notification) => {
      const notificationObj = (notification as any).toObject
        ? (notification as any).toObject()
        : notification;
      return notificationObj;
    });

    return createPaginatedResponse(data, result.total, page, limit);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const notification = await this.notificationsService.markAsRead(
      req.user.sub,
      id,
    );
    const notificationObj = (notification as any).toObject
      ? (notification as any).toObject()
      : notification;
    return notificationObj;
  }

  @Put('read-all')
  async markAllAsRead(@Req() req: any) {
    await this.notificationsService.markAllAsRead(req.user.sub);
    return { message: 'All notifications marked as read' };
  }

  @Put('read-by-action')
  async markAsReadByAction(
    @Req() req: any,
    @Body() body: { actionUrl: string },
  ) {
    const count =
      await this.notificationsService.markNotificationsAsReadByAction(
        req.user.sub,
        body.actionUrl,
      );
    return { message: `${count} notification(s) marked as read`, count };
  }

  @Delete(':id')
  async deleteNotification(@Req() req: any, @Param('id') id: string) {
    await this.notificationsService.deleteNotification(req.user.sub, id);
    return { message: 'Notification deleted successfully' };
  }

  @Delete()
  async deleteAllNotifications(@Req() req: any) {
    await this.notificationsService.deleteAllNotifications(req.user.sub);
    return { message: 'All notifications deleted successfully' };
  }

  @Post('cleanup-duplicates')
  async cleanupDuplicates(@Req() req: any) {
    const deletedCount =
      await this.notificationsService.cleanupDuplicateBookingNotifications(
        req.user.sub,
      );
    return {
      message: `Cleaned up ${deletedCount} duplicate notification(s)`,
      deletedCount,
    };
  }
}
