import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor() {
    // Initialize Firebase Admin SDK
    // Note: You need to set GOOGLE_APPLICATION_CREDENTIALS environment variable
    // or use service account key file
    try {
      if (admin.apps.length === 0) {
        // Initialize with credentials from environment variable or service account
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccountPath) {
          // Load from file path
          const serviceAccount = require(serviceAccountPath);
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } else if (serviceAccountKey) {
          // Load from JSON string in environment variable
          const serviceAccount = JSON.parse(serviceAccountKey);
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } else {
          // Don't try to initialize with default credentials on Render
          // Default credentials don't work on Render without proper Google Cloud setup
          this.logger.warn(
            'Firebase Admin SDK not initialized. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY environment variable.',
          );
          this.logger.warn(
            'Notifications will be saved to database but push notifications will not be sent.',
          );
          // Don't initialize Firebase - allow app to continue without FCM
          this.firebaseApp = null;
        }
      } else {
        this.firebaseApp = admin.app();
      }
    } catch (error) {
      this.logger.warn('Failed to initialize Firebase Admin SDK', error);
      this.logger.warn('Notifications will be saved to database but push notifications will not be sent.');
      // Don't throw error - allow app to continue without FCM
      this.firebaseApp = null;
    }
  }

  async sendNotification(
    fcmToken: string,
    title: string,
    message: string,
    data?: {
      type?: string;
      notificationId?: string;
      actionUrl?: string;
      [key: string]: any;
    },
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.debug('FCM not initialized - skipping push notification (notification saved to database)');
      return false;
    }
    
    if (!fcmToken) {
      this.logger.debug('FCM token not provided - skipping push notification (notification saved to database)');
      return false;
    }

    try {
      const messagePayload: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body: message,
        },
        data: {
          title,
          message,
          ...(data?.type && { type: data.type }),
          ...(data?.notificationId && { notificationId: data.notificationId }),
          ...(data?.actionUrl && { actionUrl: data.actionUrl }),
          ...Object.entries(data || {}).reduce((acc, [key, value]) => {
            if (key !== 'type' && key !== 'notificationId' && key !== 'actionUrl') {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>),
        },
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'wayfinder_notifications',
            sound: 'default',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(messagePayload);
      this.logger.log(`Successfully sent FCM notification: ${response}`);
      return true;
    } catch (error) {
      // Log as warning instead of error to avoid breaking the notification creation flow
      this.logger.warn(`Failed to send FCM notification: ${error.message}`);
      this.logger.debug('Notification was saved to database but push notification failed');
      return false;
    }
  }

  async sendNotificationToMultiple(
    fcmTokens: string[],
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<admin.messaging.BatchResponse> {
    if (!this.firebaseApp || !fcmTokens || fcmTokens.length === 0) {
      throw new Error('FCM not initialized or tokens not provided');
    }

    try {
      const messages: admin.messaging.Message[] = fcmTokens.map((token) => ({
        token,
        notification: {
          title,
          body: message,
        },
        data: {
          title,
          message,
          ...Object.entries(data || {}).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>),
        },
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'wayfinder_notifications',
            sound: 'default',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      }));

      const response = await admin.messaging().sendEach(messages);
      this.logger.log(`Successfully sent ${response.successCount} FCM notifications`);
      return {
        responses: response.responses,
        successCount: response.successCount,
        failureCount: response.failureCount,
      } as any;
    } catch (error) {
      this.logger.error(`Error sending FCM notifications: ${error.message}`, error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.firebaseApp !== null;
  }
}

