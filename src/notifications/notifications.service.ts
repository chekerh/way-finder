import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './notifications.schema';
import { CreateNotificationDto } from './notifications.dto';
import { FcmService } from './fcm.service';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    private readonly fcmService: FcmService,
    private readonly userService: UserService,
  ) {}

  async createNotification(userId: string, createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Check for existing unread notification of the same type for the same action
    // This prevents duplicate notifications for the same event
    const existingNotificationQuery: any = {
      userId,
      type: createNotificationDto.type,
      isRead: false,
    };

    // Add specific checks based on notification type to prevent duplicates
    if (createNotificationDto.data) {
      if (createNotificationDto.data.bookingId) {
        existingNotificationQuery['data.bookingId'] = createNotificationDto.data.bookingId;
      }
      if (createNotificationDto.data.postId) {
        existingNotificationQuery['data.postId'] = createNotificationDto.data.postId;
      }
      if (createNotificationDto.data.journeyId) {
        existingNotificationQuery['data.journeyId'] = createNotificationDto.data.journeyId;
      }
      // For likes/comments, check if there's already a notification for the same post/journey
      // within the last hour to prevent spam
      if (createNotificationDto.type === 'post_liked' || createNotificationDto.type === 'post_commented' ||
          createNotificationDto.type === 'journey_liked' || createNotificationDto.type === 'journey_commented') {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        existingNotificationQuery.createdAt = { $gte: oneHourAgo };
      }
    }

    const existingNotification = await this.notificationModel.findOne(existingNotificationQuery).exec();
    
    if (existingNotification) {
      // If notification already exists and is unread, return it instead of creating a duplicate
      console.log(`[NotificationsService] Duplicate notification prevented for user ${userId}, type ${createNotificationDto.type}`);
      return existingNotification;
    }

    const notification = new this.notificationModel({
      userId,
      ...createNotificationDto,
    });
    const savedNotification = await notification.save();
    
    // Send FCM push notification if FCM is initialized
    if (this.fcmService.isInitialized()) {
      try {
        const fcmToken = await this.userService.getFcmToken(userId);
        if (fcmToken) {
          await this.fcmService.sendNotification(
            fcmToken,
            savedNotification.title,
            savedNotification.message,
            {
              type: savedNotification.type,
              notificationId: savedNotification._id.toString(),
              actionUrl: savedNotification.actionUrl,
              ...savedNotification.data,
            },
          );
        }
      } catch (error) {
        // Log error but don't fail notification creation
        console.error('Error sending FCM notification:', error);
      }
    }
    
    return savedNotification;
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const query: any = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }
    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markNotificationsAsReadByAction(userId: string, actionUrl: string): Promise<number> {
    // Mark all notifications with matching actionUrl as read when user navigates to that screen
    const result = await this.notificationModel
      .updateMany(
        { userId, actionUrl, isRead: false },
        { isRead: true, readAt: new Date() }
      )
      .exec();
    return result.modifiedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, isRead: false }).exec();
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOne({ _id: notificationId, userId }).exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;
    notification.readAt = new Date();
    const savedNotification = await notification.save();
    return savedNotification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      )
      .exec();
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await this.notificationModel.deleteOne({ _id: notificationId, userId }).exec();
  }

  // Helper methods for creating specific notification types
  async createBookingNotification(
    userId: string,
    type: 'booking_confirmed' | 'booking_cancelled' | 'booking_updated',
    bookingId: string,
    message: string,
    data?: Record<string, any>
  ): Promise<Notification> {
    const titles = {
      booking_confirmed: 'Réservation confirmée',
      booking_cancelled: 'Réservation annulée',
      booking_updated: 'Réservation mise à jour',
    };

    return this.createNotification(userId, {
      type,
      title: titles[type],
      message,
      data: { bookingId, ...data },
      actionUrl: `/booking_detail/${bookingId}`,
    });
  }

  async createPriceAlertNotification(
    userId: string,
    destinationId: string,
    destinationName: string,
    oldPrice: number,
    newPrice: number
  ): Promise<Notification> {
    const discount = ((oldPrice - newPrice) / oldPrice) * 100;
    return this.createNotification(userId, {
      type: 'price_alert',
      title: 'Alerte de prix',
      message: `Le prix pour ${destinationName} a baissé de ${discount.toFixed(0)}% ! Nouveau prix: ${newPrice}€`,
      data: {
        destinationId,
        oldPrice,
        price: newPrice,
      },
      actionUrl: `/flight_detail/${destinationId}`,
    });
  }

  async createPaymentNotification(
    userId: string,
    type: 'payment_success' | 'payment_failed',
    bookingId: string,
    amount: number
  ): Promise<Notification> {
    return this.createNotification(userId, {
      type,
      title: type === 'payment_success' ? 'Paiement réussi' : 'Échec du paiement',
      message: type === 'payment_success'
        ? `Votre paiement de ${amount}€ a été effectué avec succès.`
        : `Le paiement de ${amount}€ a échoué. Veuillez réessayer.`,
      data: { bookingId, amount },
      actionUrl: type === 'payment_success' ? `/booking_detail/${bookingId}` : undefined,
    });
  }
}

