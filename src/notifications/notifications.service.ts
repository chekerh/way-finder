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
    // For booking operations (cancelled, confirmed, updated), always create a new notification
    // to ensure user sees popup when action is performed
    // For likes/comments, prevent spam by checking recent notifications
    const shouldPreventDuplicates = 
      createNotificationDto.type === 'post_liked' || 
      createNotificationDto.type === 'post_commented' ||
      createNotificationDto.type === 'journey_liked' || 
      createNotificationDto.type === 'journey_commented';

    let existingNotification: NotificationDocument | null = null;
    
    if (shouldPreventDuplicates) {
      // Only prevent duplicates for likes/comments within the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existingNotificationQuery: any = {
        userId,
        type: createNotificationDto.type,
        isRead: false,
        createdAt: { $gte: oneHourAgo },
      };

      if (createNotificationDto.data) {
        if (createNotificationDto.data.postId) {
          existingNotificationQuery['data.postId'] = createNotificationDto.data.postId;
        }
        if (createNotificationDto.data.journeyId) {
          existingNotificationQuery['data.journeyId'] = createNotificationDto.data.journeyId;
        }
      }

      existingNotification = await this.notificationModel.findOne(existingNotificationQuery).exec();
    }
    
    let notificationToReturn: Notification;
    
    if (existingNotification) {
      // For likes/comments: update existing notification if it's recent (within 1 hour)
      console.log(`[NotificationsService] Recent notification exists for user ${userId}, type ${createNotificationDto.type} - updating and sending push`);
      
      existingNotification.title = createNotificationDto.title;
      existingNotification.message = createNotificationDto.message;
      existingNotification.data = createNotificationDto.data || existingNotification.data;
      existingNotification.actionUrl = createNotificationDto.actionUrl || existingNotification.actionUrl;
      existingNotification.createdAt = new Date();
      existingNotification.isRead = false;
      existingNotification.readAt = null;
      
      notificationToReturn = await existingNotification.save();
    } else {
      // Always create new notification for booking operations
      // This ensures user sees popup every time an action is performed
      const notification = new this.notificationModel({
        userId,
        ...createNotificationDto,
      });
      notificationToReturn = await notification.save();
      console.log(`[NotificationsService] Created new notification for user ${userId}, type ${createNotificationDto.type}`);
    }
    
    // Always try to send FCM push notification if FCM is initialized
    // This ensures the user sees the popup when an action is performed
    // If FCM is not configured, notification is still saved to database
    if (this.fcmService.isInitialized()) {
      try {
        const fcmToken = await this.userService.getFcmToken(userId);
        if (fcmToken) {
          const notificationDoc = notificationToReturn as NotificationDocument;
          const sent = await this.fcmService.sendNotification(
            fcmToken,
            notificationDoc.title,
            notificationDoc.message,
            {
              type: notificationDoc.type,
              notificationId: notificationDoc._id.toString(),
              actionUrl: notificationDoc.actionUrl,
              ...notificationDoc.data,
            },
          );
          if (sent) {
            console.log(`[NotificationsService] FCM push notification sent for user ${userId}, type ${createNotificationDto.type}`);
          } else {
            console.log(`[NotificationsService] FCM push notification failed (notification saved to database)`);
          }
        } else {
          console.log(`[NotificationsService] No FCM token found for user ${userId} (notification saved to database)`);
        }
      } catch (error) {
        // Log error but don't fail notification creation
        // Notification is still saved to database even if push fails
        console.error('[NotificationsService] Error attempting to send FCM notification (notification saved to database):', error.message);
      }
    } else {
      console.log(`[NotificationsService] FCM service not initialized - notification saved to database (configure FIREBASE_SERVICE_ACCOUNT_KEY to enable push notifications)`);
    }
    
    return notificationToReturn;
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

