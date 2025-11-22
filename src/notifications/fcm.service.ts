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
          // Try default credentials (for Google Cloud environments)
          try {
            this.firebaseApp = admin.initializeApp({
              credential: admin.credential.applicationDefault(),
            });
          } catch (error) {
            this.logger.warn(
              'Firebase Admin SDK not initialized. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY environment variable.',
            );
          }
        }
      } else {
        this.firebaseApp = admin.app();
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
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
    if (!this.firebaseApp || !fcmToken) {
      this.logger.warn('FCM not initialized or token not provided');
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
      this.logger.error(`Error sending FCM notification: ${error.message}`, error);
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

