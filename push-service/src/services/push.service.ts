import { Injectable, Logger } from '@nestjs/common';
import { FCMService, FCMNotificationPayload, FCMMulticastPayload, FCMTopicPayload } from '../../utils/fcm';
import { CircuitBreakerState } from '../interfaces/response.interface';
import { PushNotificationDto, MultipleDeviceNotificationDto, TopicNotificationDto, NotificationStatus } from '../dto/notification.dto';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private circuitBreaker: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'CLOSED',
  };
  private readonly FAILURE_THRESHOLD = 5;
  private readonly TIMEOUT_DURATION = 60000; // 1 minute
  private readonly HALF_OPEN_MAX_CALLS = 3;
  private halfOpenCalls = 0;

  private readonly processedRequests = new Map<string, boolean>();
  private readonly REQUEST_TTL = 3600000; // 1 hour

  async sendPushNotification(notification: PushNotificationDto): Promise<{ success: boolean; message: string; notification_id?: string; error?: string }> {
    // Check idempotency
    if (this.isDuplicate(notification.request_id)) {
      this.logger.warn(`Duplicate request detected: ${notification.request_id}`);
      return {
        success: true,
        message: 'Notification already processed',
      };
    }

    // Check circuit breaker
    const circuitState = this.getCircuitState();
    if (circuitState === 'OPEN') {
      this.logger.error('Circuit breaker is OPEN. Rejecting request.');
      return {
        success: false,
        message: 'Service temporarily unavailable',
        error: 'Circuit breaker is open',
      };
    }

    try {
      const payload: FCMNotificationPayload = {
        token: notification.push_token,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        image: notification.image,
        click_action: notification.click_action,
        data: this.prepareData(notification),
      };

      const messageId = await FCMService.sendToDevice(payload);

      // Mark request as processed
      this.markAsProcessed(notification.request_id);

      // Reset circuit breaker on success
      this.onSuccess();

      this.logger.log(`Push notification sent successfully: ${messageId}`);
      return {
        success: true,
        message: 'Push notification sent successfully',
        notification_id: messageId,
      };
    } catch (error: any) {
      this.onFailure();
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);

      return {
        success: false,
        message: 'Failed to send push notification',
        error: error.message,
      };
    }
  }

  async sendToMultipleDevices(notification: MultipleDeviceNotificationDto): Promise<{ success: boolean; message: string; success_count?: number; failure_count?: number }> {
    const circuitState = this.getCircuitState();
    if (circuitState === 'OPEN') {
      this.logger.error('Circuit breaker is OPEN. Rejecting request.');
      return {
        success: false,
        message: 'Service temporarily unavailable',
      };
    }

    try {
      const payload: FCMMulticastPayload = {
        tokens: notification.tokens,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        data: notification.metadata ? this.metadataToStringMap(notification.metadata) : undefined,
      };

      const response = await FCMService.sendToMultipleDevices(payload);

      this.onSuccess();

      return {
        success: true,
        message: `Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`,
        success_count: response.successCount,
        failure_count: response.failureCount,
      };
    } catch (error: any) {
      this.onFailure();
      this.logger.error(`Failed to send multicast notification: ${error.message}`, error.stack);

      return {
        success: false,
        message: 'Failed to send multicast notification',
      };
    }
  }

  async sendToTopic(notification: TopicNotificationDto): Promise<{ success: boolean; message: string; notification_id?: string }> {
    const circuitState = this.getCircuitState();
    if (circuitState === 'OPEN') {
      this.logger.error('Circuit breaker is OPEN. Rejecting request.');
      return {
        success: false,
        message: 'Service temporarily unavailable',
      };
    }

    try {
      const payload: FCMTopicPayload = {
        topic: notification.topic,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        data: notification.metadata ? this.metadataToStringMap(notification.metadata) : undefined,
      };

      const messageId = await FCMService.sendToTopic(payload);

      this.onSuccess();

      return {
        success: true,
        message: 'Topic notification sent successfully',
        notification_id: messageId,
      };
    } catch (error: any) {
      this.onFailure();
      this.logger.error(`Failed to send topic notification: ${error.message}`, error.stack);

      return {
        success: false,
        message: 'Failed to send topic notification',
      };
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      return await FCMService.validateToken(token);
    } catch (error: any) {
      this.logger.error(`Error validating token: ${error.message}`);
      return false;
    }
  }

  private prepareData(notification: PushNotificationDto): Record<string, string> {
    const data: Record<string, string> = {
      user_id: notification.user_id,
      request_id: notification.request_id,
      priority: (notification.priority || 5).toString(),
    };

    if (notification.metadata) {
      Object.keys(notification.metadata).forEach((key) => {
        data[key] = String(notification.metadata![key]);
      });
    }

    return data;
  }

  private metadataToStringMap(metadata: Record<string, any>): Record<string, string> {
    const stringMap: Record<string, string> = {};
    Object.keys(metadata).forEach((key) => {
      stringMap[key] = String(metadata[key]);
    });
    return stringMap;
  }

  private isDuplicate(requestId: string): boolean {
    return this.processedRequests.has(requestId);
  }

  private markAsProcessed(requestId: string): void {
    this.processedRequests.set(requestId, true);
    setTimeout(() => {
      this.processedRequests.delete(requestId);
    }, this.REQUEST_TTL);
  }

  private getCircuitState(): 'OPEN' | 'CLOSED' | 'HALF_OPEN' {
    const now = Date.now();

    if (this.circuitBreaker.state === 'OPEN') {
      if (now - this.circuitBreaker.lastFailureTime > this.TIMEOUT_DURATION) {
        this.logger.log('Circuit breaker transitioning to HALF_OPEN');
        this.circuitBreaker.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
      }
    }

    return this.circuitBreaker.state;
  }

  private onSuccess(): void {
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.halfOpenCalls++;
      if (this.halfOpenCalls >= this.HALF_OPEN_MAX_CALLS) {
        this.logger.log('Circuit breaker transitioning to CLOSED');
        this.circuitBreaker = {
          failures: 0,
          lastFailureTime: 0,
          state: 'CLOSED',
        };
        this.halfOpenCalls = 0;
      }
    } else if (this.circuitBreaker.state === 'CLOSED') {
      this.circuitBreaker.failures = 0;
    }
  }

  private onFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.logger.warn('Circuit breaker transitioning back to OPEN');
      this.circuitBreaker.state = 'OPEN';
      this.halfOpenCalls = 0;
    } else if (this.circuitBreaker.failures >= this.FAILURE_THRESHOLD) {
      this.logger.error('Circuit breaker transitioning to OPEN');
      this.circuitBreaker.state = 'OPEN';
    }
  }

  getCircuitBreakerStatus(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }
}
