import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notifications.schema';
import { CreateNotificationDto } from './notifications.dto';
import { FcmService } from './fcm.service';
import { UserService } from '../user/user.service';
import { Booking, BookingDocument } from '../booking/booking.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly fcmService: FcmService,
    private readonly userService: UserService,
  ) {}

  async createNotification(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    // CRITICAL: For booking-related notifications, verify the booking still exists
    // This prevents notifications for deleted/cancelled bookings from being sent repeatedly
    const isBookingNotification =
      createNotificationDto.type === 'booking_confirmed' ||
      createNotificationDto.type === 'booking_cancelled' ||
      createNotificationDto.type === 'booking_updated';

    // Declare variables that will be used in both branches
    let notificationToReturn: NotificationDocument;
    let shouldSendFCM = false;

    if (isBookingNotification && createNotificationDto.data?.bookingId) {
      const bookingId = createNotificationDto.data.bookingId;
      
      // Verify booking exists before creating notification
      const booking = await this.bookingModel
        .findById(new Types.ObjectId(bookingId))
        .exec();

      if (!booking) {
        console.log(
          `[NotificationsService] ⚠️ Booking ${bookingId} does not exist. Skipping notification creation to prevent infinite loop.`,
        );
        // Return a dummy notification document to avoid breaking the flow
        // but don't save it or send FCM
        throw new NotFoundException(
          `Cannot create notification: Booking ${bookingId} does not exist`,
        );
      }

      // PERMANENT deduplication: Use atomic findOneAndUpdate to prevent race conditions
      // This prevents multiple notifications from being created simultaneously
      const deduplicationKey = {
        userId: new Types.ObjectId(userId),
        type: createNotificationDto.type,
        'data.bookingId': bookingId,
      };

      // Try to find existing notification atomically
      const existingNotification = await this.notificationModel
        .findOne(deduplicationKey)
        .sort({ createdAt: -1 })
        .exec();

      if (existingNotification) {
        // Reduced logging - only log once per minute to avoid spam
        const shouldLog = !existingNotification.createdAt || 
          (Date.now() - existingNotification.createdAt.getTime()) > 60000; // Only log if notification is older than 1 minute
        
        if (shouldLog) {
          console.log(
            `[NotificationsService] ⚠️ PERMANENT DEDUPLICATION: Notification of type "${createNotificationDto.type}" already exists for booking ${bookingId} (user ${userId})`,
          );
          // Log call stack to identify what's calling this repeatedly (only occasionally)
          const stack = new Error().stack;
          console.log(
            `[NotificationsService] ⚠️ DUPLICATE CALL DETECTED - Call stack: ${stack?.split('\n').slice(1, 6).join('\n')}`,
          );
        }
        // Return existing notification without creating a new one or sending FCM
        // CRITICAL: Early return prevents any FCM sending
        return existingNotification;
      }

      // CRITICAL: Use findOneAndUpdate with upsert to atomically create or return existing
      // This prevents race conditions where multiple requests try to create the same notification
      const notificationData = {
        userId: new Types.ObjectId(userId),
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        data: createNotificationDto.data || {},
        actionUrl: createNotificationDto.actionUrl,
        isRead: false,
      };

      // Try to atomically create the notification or get existing one
      // $setOnInsert ensures we only set values when creating, not when updating existing
      let atomicNotification: NotificationDocument;
      try {
        atomicNotification = await this.notificationModel
          .findOneAndUpdate(
            deduplicationKey,
            {
              $setOnInsert: notificationData, // Only set on insert, not on update
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
            },
          )
          .exec();
      } catch (error: any) {
        // If unique index violation (duplicate key error), fetch the existing notification
        if (error.code === 11000 || error.codeName === 'DuplicateKey') {
          console.log(
            `[NotificationsService] ⚠️ Unique index violation - notification already exists. Fetching existing notification.`,
          );
          atomicNotification = await this.notificationModel
            .findOne(deduplicationKey)
            .exec();
          if (!atomicNotification) {
            throw new Error('Failed to find existing notification after duplicate key error');
          }
          // Return existing notification without sending FCM
          return atomicNotification;
        }
        throw error;
      }

      // Check if this was a newly created notification
      // If we found an existing notification before the upsert, this is definitely not new
      // If createdAt is very recent (within last 1 second), it might be newly created
      // But if we found existingNotification earlier, we know it's not new
      if (existingNotification) {
        console.log(
          `[NotificationsService] ⚠️ RACE CONDITION PREVENTED: Another request created the notification first. Using existing notification.`,
        );
        // Return the existing notification without sending FCM again
        return atomicNotification;
      }
      
      // Double-check: if createdAt is older than 1 second, it's definitely not new
      const now = new Date();
      const createdAt = atomicNotification.createdAt || now;
      const timeDiff = now.getTime() - createdAt.getTime();
      if (timeDiff > 1000) {
        console.log(
          `[NotificationsService] ⚠️ Notification appears to be existing (created ${timeDiff}ms ago). Skipping FCM.`,
        );
        return atomicNotification;
      }

      console.log(
        `[NotificationsService] ✅ Atomically created new notification for user ${userId}, type ${createNotificationDto.type}, ID: ${atomicNotification._id}`,
      );
      
      // Continue with FCM sending for the newly created notification
      notificationToReturn = atomicNotification;
      shouldSendFCM = true;
      
      // Skip the rest of the notification creation logic since we already created it atomically
      // Go directly to FCM sending section at the end
    } else {
      // For non-booking notifications, use normal flow
      
      // For likes/comments, prevent duplicates within 5 minutes to avoid spam
      const shouldPreventDuplicates =
        createNotificationDto.type === 'post_liked' ||
        createNotificationDto.type === 'post_commented' ||
        createNotificationDto.type === 'journey_liked' ||
        createNotificationDto.type === 'journey_commented';

      let existingNotificationForSocial: NotificationDocument | null = null;

      if (shouldPreventDuplicates) {
        // Only prevent duplicates for likes/comments within the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const existingNotificationQuery: any = {
          userId: new Types.ObjectId(userId),
          type: createNotificationDto.type,
          createdAt: { $gte: fiveMinutesAgo },
        };

        if (createNotificationDto.data?.postId) {
          existingNotificationQuery['data.postId'] =
            createNotificationDto.data.postId;
        }
        if (createNotificationDto.data?.journeyId) {
          existingNotificationQuery['data.journeyId'] =
            createNotificationDto.data.journeyId;
        }

        existingNotificationForSocial = await this.notificationModel
          .findOne(existingNotificationQuery)
          .exec();
      }

      if (existingNotificationForSocial && shouldPreventDuplicates) {
        // For likes/comments: A notification already exists within the last 5 minutes
        // DO NOT create a new one or send another FCM notification to avoid spam
        console.log(
          `[NotificationsService] ⚠️ Duplicate notification prevented for user ${userId}, type ${createNotificationDto.type}`,
        );
        console.log(
          `[NotificationsService] Existing notification ID: ${existingNotificationForSocial._id}, created at: ${existingNotificationForSocial.createdAt}`,
        );
        console.log(
          `[NotificationsService] Skipping notification creation and FCM send to prevent spam`,
        );

        // Return existing notification without sending FCM
        notificationToReturn = existingNotificationForSocial;
        shouldSendFCM = false; // DO NOT send FCM for duplicate likes/comments
      } else {
        // For non-booking notifications: No recent duplicate found - create new one
        const notification = new this.notificationModel({
          userId: new Types.ObjectId(userId),
          ...createNotificationDto,
        });
        notificationToReturn = await notification.save();
        console.log(
          `[NotificationsService] ✅ Created new notification for user ${userId}, type ${createNotificationDto.type}, ID: ${notificationToReturn._id}`,
        );
        shouldSendFCM = true; // Always send FCM for new notifications
      }
    }

    // Send FCM push notification ONLY if this is a new notification (not a duplicate)
    console.log(
      `[NotificationsService] Attempting to send FCM - shouldSendFCM: ${shouldSendFCM}, isInitialized: ${this.fcmService.isInitialized()}`,
    );

    if (shouldSendFCM && this.fcmService.isInitialized()) {
      try {
        const fcmToken = await this.userService.getFcmToken(userId);
        console.log(
          `[NotificationsService] FCM token for user ${userId}: ${fcmToken ? 'FOUND' : 'NOT FOUND'}`,
        );

        if (fcmToken) {
          console.log(
            `[NotificationsService] Sending FCM notification to token: ${fcmToken.substring(0, 20)}...`,
          );
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
            console.log(
              `[NotificationsService] ✅ FCM push notification sent successfully for user ${userId}, type ${createNotificationDto.type}`,
            );
          } else {
            console.log(
              `[NotificationsService] ⚠️ FCM push notification failed (notification saved to database)`,
            );
            console.log(
              `[NotificationsService] Check FCM service logs above for error details`,
            );
          }
        } else {
          console.log(
            `[NotificationsService] ⚠️ No FCM token found for user ${userId}`,
          );
          console.log(
            `[NotificationsService] User needs to register FCM token via POST /api/user/fcm-token`,
          );
          console.log(
            `[NotificationsService] Notification saved to database but push notification not sent`,
          );
        }
      } catch (error: any) {
        // Log error but don't fail notification creation
        // Notification is still saved to database even if push fails
        console.error(
          '[NotificationsService] ❌ Error attempting to send FCM notification:',
          error.message,
        );
        console.error('[NotificationsService] Error stack:', error.stack);
        console.error(
          '[NotificationsService] Notification saved to database but push notification failed',
        );
      }
    } else if (!shouldSendFCM) {
      console.log(
        `[NotificationsService] ⏭️ Skipping FCM send - duplicate notification prevented`,
      );
    } else if (!this.fcmService.isInitialized()) {
      console.log(`[NotificationsService] ⚠️ FCM service not initialized`);
      console.log(
        `[NotificationsService] Configure FIREBASE_SERVICE_ACCOUNT_KEY environment variable on Render`,
      );
      console.log(
        `[NotificationsService] Notification saved to database but push notifications are disabled`,
      );
    }

    return notificationToReturn;
  }

  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
  ): Promise<NotificationDocument[]> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (unreadOnly) {
      query.isRead = false;
    }
    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markNotificationsAsReadByAction(
    userId: string,
    actionUrl: string,
  ): Promise<number> {
    // Mark all notifications with matching actionUrl as read when user navigates to that screen
    const result = await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), actionUrl, isRead: false },
        { isRead: true, readAt: new Date() },
      )
      .exec();
    return result.modifiedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ userId: new Types.ObjectId(userId), isRead: false })
      .exec();
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findOne({ _id: notificationId, userId: new Types.ObjectId(userId) })
      .exec();
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
        { userId: new Types.ObjectId(userId), isRead: false },
        { isRead: true, readAt: new Date() },
      )
      .exec();
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<void> {
    await this.notificationModel
      .deleteOne({ _id: notificationId, userId: new Types.ObjectId(userId) })
      .exec();
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ userId: new Types.ObjectId(userId) }).exec();
  }

  /**
   * Delete all notifications related to a specific booking
   * This is called when a booking is permanently deleted to prevent infinite notification loops
   */
  async deleteNotificationsByBookingId(
    userId: string,
    bookingId: string,
  ): Promise<void> {
    const result = await this.notificationModel
      .deleteMany({
        userId: new Types.ObjectId(userId),
        'data.bookingId': bookingId,
      })
      .exec();
    console.log(
      `[NotificationsService] ✅ Deleted ${result.deletedCount} notification(s) for booking ${bookingId}`,
    );
  }

  // Helper methods for creating specific notification types
  async createBookingNotification(
    userId: string,
    type: 'booking_confirmed' | 'booking_cancelled' | 'booking_updated',
    bookingId: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<NotificationDocument> {
    // Log only for new notifications (not duplicates) to reduce spam
    // The createNotification method will handle deduplication and logging

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
    newPrice: number,
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
    amount: number,
  ): Promise<NotificationDocument> {
    return this.createNotification(userId, {
      type,
      title:
        type === 'payment_success' ? 'Paiement réussi' : 'Échec du paiement',
      message:
        type === 'payment_success'
          ? `Votre paiement de ${amount}€ a été effectué avec succès.`
          : `Le paiement de ${amount}€ a échoué. Veuillez réessayer.`,
      data: { bookingId, amount },
      actionUrl:
        type === 'payment_success' ? `/booking_detail/${bookingId}` : undefined,
    });
  }
}
