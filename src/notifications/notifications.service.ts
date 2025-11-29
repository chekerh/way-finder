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
      // Ensure bookingId is a string (not ObjectId) for consistent indexing
      const bookingId = String(createNotificationDto.data.bookingId);
      
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
      // CRITICAL: Ensure bookingId is always a string for consistent indexing
      const deduplicationKey = {
        userId: new Types.ObjectId(userId),
        type: createNotificationDto.type,
        'data.bookingId': String(bookingId), // Always use string for consistent indexing
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
      // Ensure bookingId is stored as string in data for consistent indexing
      const notificationData: any = {
        userId: new Types.ObjectId(userId),
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        actionUrl: createNotificationDto.actionUrl,
        isRead: false,
      };
      
      // Ensure data.bookingId is a string for consistent indexing
      if (createNotificationDto.data) {
        notificationData.data = { ...createNotificationDto.data };
        if (notificationData.data.bookingId) {
          notificationData.data.bookingId = String(notificationData.data.bookingId);
        }
      } else {
        notificationData.data = {};
      }

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
          const existingAtomicNotification = await this.notificationModel
            .findOne(deduplicationKey)
            .exec();
          if (!existingAtomicNotification) {
            throw new Error('Failed to find existing notification after duplicate key error');
          }
          // Return existing notification without sending FCM
          return existingAtomicNotification;
        }
        throw error;
      }

      // CRITICAL: Check if this notification was already existing before we tried to create it
      // If we found an existing notification before the upsert, this is definitely not new
      if (existingNotification) {
        console.log(
          `[NotificationsService] ⚠️ RACE CONDITION PREVENTED: Another request created the notification first. Using existing notification.`,
        );
        // Return the existing notification without sending FCM again
        return atomicNotification;
      }
      
      // CRITICAL: Double-check if the notification was already existing by checking createdAt
      // If createdAt is older than 2 seconds, it was definitely already existing
      const now = new Date();
      const createdAt = atomicNotification.createdAt || now;
      const timeDiff = now.getTime() - createdAt.getTime();
      
      // If the notification was created more than 2 seconds ago, it was already existing
      // This handles race conditions where two requests both don't find existingNotification
      // but one creates it before the other, and the second one gets the existing one
      if (timeDiff > 2000) {
        console.log(
          `[NotificationsService] ⚠️ Notification was already existing (created ${timeDiff}ms ago). Skipping FCM.`,
        );
        // Return existing notification without sending FCM
        return atomicNotification;
      }

      // Additional check: if updatedAt is different from createdAt, the notification was updated (not newly created)
      if (atomicNotification.updatedAt && atomicNotification.createdAt && 
          atomicNotification.updatedAt.getTime() !== atomicNotification.createdAt.getTime()) {
        console.log(
          `[NotificationsService] ⚠️ Notification was updated (not newly created). Skipping FCM.`,
        );
        return atomicNotification;
      }
      
      // CRITICAL: Final check - query again to make absolutely sure this notification is unique
      // This catches cases where the index unique didn't work or wasn't applied
      // Only do this check if the notification was created very recently (within 1 second)
      if (timeDiff <= 1000) {
        const finalCheck = await this.notificationModel
          .find(deduplicationKey)
          .sort({ createdAt: -1 })
          .limit(2)
          .exec();
        
        if (finalCheck.length > 1) {
          // Multiple notifications with the same key exist - this is a duplicate
          // Return the oldest one (first in sorted order)
          console.log(
            `[NotificationsService] ⚠️ Multiple notifications with same key exist (${finalCheck.length} found). This is a duplicate. Skipping FCM and returning oldest.`,
          );
          return finalCheck[finalCheck.length - 1]; // Return the oldest one
        }
        
        // If we got the notification we just created, make sure it's the only one
        if (finalCheck.length === 1 && finalCheck[0]._id.toString() !== atomicNotification._id.toString()) {
          console.log(
            `[NotificationsService] ⚠️ Another notification with same key exists (ID: ${finalCheck[0]._id}). This is a duplicate. Skipping FCM.`,
          );
          return finalCheck[0]; // Return the existing one
        }
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
        'data.bookingId': String(bookingId), // Ensure bookingId is string for consistent querying
      })
      .exec();
    console.log(
      `[NotificationsService] ✅ Deleted ${result.deletedCount} notification(s) for booking ${bookingId}`,
    );
  }

  /**
   * Check if a notification already exists for a booking
   * This is used to prevent unnecessary calls to createNotification
   */
  async findExistingNotification(
    userId: string,
    type: 'booking_confirmed' | 'booking_cancelled' | 'booking_updated',
    bookingId: string,
  ): Promise<NotificationDocument | null> {
    const deduplicationKey = {
      userId: new Types.ObjectId(userId),
      type: type,
      'data.bookingId': String(bookingId), // Ensure bookingId is string for consistent querying
    };
    
    return await this.notificationModel
      .findOne(deduplicationKey)
      .sort({ createdAt: -1 }) // Get the most recent one
      .exec();
  }
  
  /**
   * Clean up duplicate notifications for booking-related events
   * This removes all but the most recent notification for each bookingId+type combination
   */
  async cleanupDuplicateBookingNotifications(userId: string): Promise<number> {
    const bookingTypes: Array<'booking_confirmed' | 'booking_cancelled' | 'booking_updated'> = [
      'booking_confirmed',
      'booking_cancelled',
      'booking_updated',
    ];
    
    let totalDeleted = 0;
    
    for (const type of bookingTypes) {
      // Find all notifications of this type for this user
      const allNotifications = await this.notificationModel
        .find({
          userId: new Types.ObjectId(userId),
          type: type,
          'data.bookingId': { $exists: true },
        })
        .sort({ createdAt: -1 })
        .exec();
      
      // Group by bookingId
      const notificationsByBookingId = new Map<string, NotificationDocument[]>();
      for (const notification of allNotifications) {
        const bookingId = String(notification.data?.bookingId || '');
        if (bookingId) {
          if (!notificationsByBookingId.has(bookingId)) {
            notificationsByBookingId.set(bookingId, []);
          }
          notificationsByBookingId.get(bookingId)!.push(notification);
        }
      }
      
      // For each bookingId, keep only the most recent notification and delete the rest
      for (const [bookingId, notifications] of notificationsByBookingId.entries()) {
        if (notifications.length > 1) {
          // Keep the first one (most recent), delete the rest
          const toDelete = notifications.slice(1);
          const idsToDelete = toDelete.map((n) => n._id);
          
          const result = await this.notificationModel
            .deleteMany({ _id: { $in: idsToDelete } })
            .exec();
          
          totalDeleted += result.deletedCount;
          console.log(
            `[NotificationsService] 🧹 Cleaned up ${result.deletedCount} duplicate ${type} notification(s) for booking ${bookingId}`,
          );
        }
      }
    }
    
    if (totalDeleted > 0) {
      console.log(
        `[NotificationsService] ✅ Cleaned up ${totalDeleted} total duplicate booking notifications`,
      );
    }
    
    return totalDeleted;
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
