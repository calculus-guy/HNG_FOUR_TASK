import * as admin from 'firebase-admin';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FirebaseAdmin {
  private static instance: admin.app.App | null = null;
  private readonly logger = new Logger(FirebaseAdmin.name);

  static initialize(): admin.app.App {
    if (this.instance) {
      return this.instance;
    }

    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
          'Missing Firebase credentials. Please check your .env file contains: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY',
        );
      }

      // Initialize Firebase Admin SDK
      this.instance = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });

      console.log('Firebase Admin SDK initialized successfully');
      return this.instance;
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw error;
    }
  }

  static getMessaging(): admin.messaging.Messaging {
    if (!this.instance) {
      this.initialize();
    }
    return admin.messaging();
  }
}

export interface FCMNotificationPayload {
  token: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  click_action?: string;
  data?: Record<string, string>;
}

export interface FCMMulticastPayload {
  tokens: string[];
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, string>;
}

export interface FCMTopicPayload {
  topic: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, string>;
}

export class FCMService {
  private static readonly logger = new Logger(FCMService.name);

  private static getMessagingInstance(): admin.messaging.Messaging {
    return FirebaseAdmin.getMessaging();
  }

  /**
   * Send notification to a single device
   */
  static async sendToDevice(payload: FCMNotificationPayload): Promise<string> {
    try {
      const messaging = this.getMessagingInstance();
      const message: admin.messaging.Message = {
        token: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
            image: payload.image,
          },
          fcmOptions: {
            link: payload.click_action,
          },
        },
        data: payload.data,
      };

      const response = await messaging.send(message);
      this.logger.log(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   */
  static async sendToMultipleDevices(
    payload: FCMMulticastPayload,
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const messaging = this.getMessagingInstance();
      const message: admin.messaging.MulticastMessage = {
        tokens: payload.tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
            image: payload.image,
          },
        },
        data: payload.data,
      };

      const response = await messaging.sendEachForMulticast(message);
      this.logger.log(
        `Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Error sending multicast message: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  static async sendToTopic(
    payload: FCMTopicPayload,
  ): Promise<string> {
    try {
      const messaging = this.getMessagingInstance();
      const message: admin.messaging.Message = {
        topic: payload.topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
            image: payload.image,
          },
        },
        data: payload.data,
      };

      const response = await messaging.send(message);
      this.logger.log(`Successfully sent topic message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Error sending topic message: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Validate a device token
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      const messaging = this.getMessagingInstance();
      await messaging.send(
        {
          token,
          data: { test: 'validation' },
        },
        true, // dryRun
      );
      return true;
    } catch (error) {
      this.logger.warn(`Invalid token: ${error.message}`);
      return false;
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  static async subscribeToTopic(
    tokens: string[],
    topic: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    try {
      const messaging = this.getMessagingInstance();
      const response = await messaging.subscribeToTopic(tokens, topic);
      this.logger.log(
        `Successfully subscribed ${response.successCount} tokens to topic: ${topic}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Error subscribing to topic: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  static async unsubscribeFromTopic(
    tokens: string[],
    topic: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    try {
      const messaging = this.getMessagingInstance();
      const response = await messaging.unsubscribeFromTopic(tokens, topic);
      this.logger.log(
        `Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Error unsubscribing from topic: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
