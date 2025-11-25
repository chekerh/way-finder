import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notifications.schema';
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

  async createNotification(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    // Prevent duplicate notifications for ALL types within a short time window (5 minutes)
    // This ensures each action (like, comment, booking cancelled) only sends ONE notification
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const existingNotificationQuery: any = {
      userId,
      type: createNotificationDto.type,
      createdAt: { $gte: fiveMinutesAgo }, // Check within last 5 minutes
    };

    // For booking notifications, check by bookingId to prevent duplicates for same booking
    if (createNotificationDto.type === 'booking_cancelled' || 
        createNotificationDto.type === 'booking_confirmed' || 
        createNotificationDto.type === 'booking_updated') {
      if (createNotificationDto.data?.bookingId) {
        existingNotificationQuery['data.bookingId'] = createNotificationDto.data.bookingId;
      }
    }
    
    // For likes/comments, check by postId or journeyId
    if (createNotificationDto.type === 'post_liked' || 
        createNotificationDto.type === 'post_commented' ||
        createNotificationDto.type === 'journey_liked' || 
        createNotificationDto.type === 'journey_commented') {
      if (createNotificationDto.data?.postId) {
        existingNotificationQuery['data.postId'] = createNotificationDto.data.postId;
      }
      if (createNotificationDto.data?.journeyId) {
        existingNotificationQuery['data.journeyId'] = createNotificationDto.data.journeyId;
      }
    }

    const existingNotification = await this.notificationModel.findOne(existingNotificationQuery).exec();
    
    let notificationToReturn: NotificationDocument;
    let shouldSendFCM = false;
    
    if (existingNotification) {
      // A notification for this action already exists within the last 5 minutes
      // DO NOT create a new one or send another FCM notification
      console.log(`[NotificationsService] ⚠️ Duplicate notification prevented for user ${userId}, type ${createNotificationDto.type}, bookingId: ${createNotificationDto.data?.bookingId || 'N/A'}`);
      console.log(`[NotificationsService] Existing notification ID: ${existingNotification._id}, created at: ${existingNotification.createdAt}`);
      console.log(`[NotificationsService] Skipping notification creation and FCM send to prevent duplicates`);
      
      // Return existing notification without sending FCM
      notificationToReturn = existingNotification;
      shouldSendFCM = false; // DO NOT send FCM for duplicate
    } else {
      // No recent notification exists - create new one and send FCM
      const notification = new this.notificationModel({
        userId,
        ...createNotificationDto,
      });
      notificationToReturn = await notification.save();
      console.log(`[NotificationsService] ✅ Created new notification for user ${userId}, type ${createNotificationDto.type}, ID: ${notificationToReturn._id}`);
      shouldSendFCM = true; // Send FCM only for new notifications
    }
    
    // Send FCM push notification ONLY if this is a new notification (not a duplicate)
    if (shouldSendFCM && this.fcmService.isInitialized()) {
      try {
        const fcmToken = await this.userService.getFcmToken(userId);
        if (fcmToken) {
          const sent = await this.fcmService.sendNotification(
            fcmToken,
            notificationToReturn.title,
            notificationToReturn.message,
            {
              type: notificationToReturn.type,
              notificationId: notificationToReturn._id.toString(),
              actionUrl: notificationToReturn.actionUrl,
              ...notificationToReturn.data,
            },
          );
          if (sent) {
            console.log(`[NotificationsService] ✅ FCM push notification sent for user ${userId}, type ${createNotificationDto.type}`);
          } else {
            console.log(`[NotificationsService] ⚠️ FCM push notification failed (notification saved to database)`);
          }
        } else {
          console.log(`[NotificationsService] ⚠️ No FCM token found for user ${userId} (notification saved to database)`);
        }
      } catch (error) {
        // Log error but don't fail notification creation
        // Notification is still saved to database even if push fails
        console.error('[NotificationsService] ❌ Error attempting to send FCM notification (notification saved to database):', error.message);
      }
    } else if (!shouldSendFCM) {
      console.log(`[NotificationsService] ⏭️ Skipping FCM send - duplicate notification prevented`);
    } else if (!this.fcmService.isInitialized()) {
      console.log(`[NotificationsService] ⚠️ FCM service not initialized - notification saved to database (configure FIREBASE_SERVICE_ACCOUNT_KEY to enable push notifications)`);
    }
    
    return notificationToReturn;
  }

  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
  ): Promise<NotificationDocument[]> {
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

  async markAsRead(userId: string, notificationId: string): Promise<NotificationDocument> {
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
  ): Promise<NotificationDocument> {
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
  ): Promise<NotificationDocument> {
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
  ): Promise<NotificationDocument> {
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

