import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQProvider } from '../queues/rabbitmq.provider';
import { PushService } from '../services/push.service';
import { PushNotificationMessage } from '../interfaces/response.interface';

@Injectable()
export class PushConsumer implements OnModuleInit {
  private readonly logger = new Logger(PushConsumer.name);

  constructor(
    private readonly rabbitmqProvider: RabbitMQProvider,
    private readonly pushService: PushService,
  ) {}

  async onModuleInit() {
    this.startConsuming().catch((error) => {
      this.logger.error(
        `Failed to start consumer: ${error.message}. Will retry automatically.`,
      );
    });
  }

  private async startConsuming(): Promise<void> {
    try {
      this.logger.log('Starting push notification consumer...');

      await this.rabbitmqProvider.consumeMessages('push.queue', async (msg) => {
        const content = msg.content.toString();
        this.logger.log(`Received message: ${content}`);

        try {
          const notification: PushNotificationMessage = JSON.parse(content);
          await this.processNotification(notification);
        } catch (error: any) {
          this.logger.error(`Error parsing message: ${error.message}`);
          throw error;
        }
      });

      this.logger.log('Push notification consumer started successfully');
    } catch (error: any) {
      this.logger.error(
        `Failed to start consumer: ${error.message}. The service will continue to retry in the background.`,
      );
      throw error;
    }
  }

  private async processNotification(notification: PushNotificationMessage): Promise<void> {
    try {
      this.logger.log(`Processing notification for user ${notification.user_id}`);

      const result = await this.pushService.sendPushNotification({
        user_id: notification.user_id,
        push_token: notification.push_token,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        image: notification.image,
        click_action: notification.click_action,
        request_id: notification.request_id,
        priority: notification.priority,
        metadata: notification.metadata,
      });

      if (result.success) {
        this.logger.log(`Successfully sent push notification: ${result.notification_id}`);
      } else {
        this.logger.error(`Failed to send push notification: ${result.error}`);
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: any) {
      this.logger.error(`Error processing notification: ${error.message}`, error.stack);
      throw error;
    }
  }
}
