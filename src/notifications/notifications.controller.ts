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
import { CreateNotificationDto, UpdateNotificationDto } from './notifications.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(@Req() req: any, @Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationsService.createNotification(
      req.user.sub,
      createNotificationDto,
    );
    const notificationObj = (notification as any).toObject ? (notification as any).toObject() : notification;
    return notificationObj;
  }

  @Get()
  async getNotifications(@Req() req: any, @Query('unreadOnly') unreadOnly?: string) {
    const notifications = await this.notificationsService.getUserNotifications(
      req.user.sub,
      unreadOnly === 'true',
    );
    return notifications.map((notification) => {
      const notificationObj = (notification as any).toObject ? (notification as any).toObject() : notification;
      return notificationObj;
    });
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const notification = await this.notificationsService.markAsRead(req.user.sub, id);
    const notificationObj = (notification as any).toObject ? (notification as any).toObject() : notification;
    return notificationObj;
  }

  @Put('read-all')
  async markAllAsRead(@Req() req: any) {
    await this.notificationsService.markAllAsRead(req.user.sub);
    return { message: 'All notifications marked as read' };
  }

  @Put('read-by-action')
  async markAsReadByAction(@Req() req: any, @Body() body: { actionUrl: string }) {
    const count = await this.notificationsService.markNotificationsAsReadByAction(req.user.sub, body.actionUrl);
    return { message: `${count} notification(s) marked as read`, count };
  }

  @Delete(':id')
  async deleteNotification(@Req() req: any, @Param('id') id: string) {
    await this.notificationsService.deleteNotification(req.user.sub, id);
    return { message: 'Notification deleted successfully' };
  }
}

