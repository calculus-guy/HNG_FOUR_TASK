import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { logger } from '../utils/logger';

@Injectable()
export class RabbitMQProvider implements OnModuleInit, OnModuleDestroy {
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.ConfirmChannel | null = null;
  private isConnecting = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connectWithRetry(): Promise<void> {
    const maxRetries = 5;
    const baseDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`RabbitMQ connection attempt ${attempt}/${maxRetries}`);
        await this.connect();
        logger.info('RabbitMQ connected successfully');
        return;
      } catch (error) {
        logger.error(`RabbitMQ connection attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw new Error(`Failed to connect to RabbitMQ after ${maxRetries} attempts`);
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        logger.info(`Retrying RabbitMQ connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    try {
      const rabbitmqConfig = this.configService.get<{
        url: string;
        exchange: string;
        queue: string;
      }>('email.rabbitmq');

      if (!rabbitmqConfig) {
        throw new Error('RabbitMQ configuration not found');
      }
      this.connection = await amqplib.connect(rabbitmqConfig.url);
      this.channel = await this.connection.createConfirmChannel();
      await this.channel.assertExchange(rabbitmqConfig.exchange, 'direct', { durable: true });

      // Ensure the queue exists before binding
      await this.channel.assertQueue(rabbitmqConfig.queue, { durable: true });

      // Match the API Gateway routing keys (notification.email)
      const routingKey = 'notification.email';

      try {
        await this.channel.bindQueue(
          rabbitmqConfig.queue,
          rabbitmqConfig.exchange,
          routingKey,
        );
        logger.info('Queue bound to exchange successfully', {
          queue: rabbitmqConfig.queue,
          exchange: rabbitmqConfig.exchange,
          routingKey,
        });
      } catch (bindError) {
        logger.info('Queue binding may already exist', {
          queue: rabbitmqConfig.queue,
          exchange: rabbitmqConfig.exchange,
          routingKey,
        });
      }
      this.connection.on('error', (err: Error) => {
        logger.error('RabbitMQ connection error', err);
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.connection = null;
        this.channel = null;
      });

      logger.info('RabbitMQ connected successfully', {
        queue: rabbitmqConfig.queue,
        exchange: rabbitmqConfig.exchange,
      });
    } catch (error) {
      this.connection = null;
      this.channel = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      logger.info('RabbitMQ disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  getChannel(): amqplib.ConfirmChannel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }
    return this.channel;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  async waitForConnection(): Promise<void> {
    const maxWaitTime = 30000;
    const checkInterval = 1000;
    let elapsed = 0;

    while (elapsed < maxWaitTime) {
      if (this.isConnected()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }

    throw new Error('RabbitMQ connection timeout');
  }
  async sendToDeadLetterQueue(message: any, reason: string): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const rabbitmqConfig = this.configService.get('email.rabbitmq');
    const deadLetterMessage = {
      ...message,
      dead_letter_reason: reason,
      original_timestamp: message.timestamp || new Date().toISOString(),
      dead_letter_timestamp: new Date().toISOString(),
    };
    logger.warn('Message marked for dead letter queue', {
      reason,
      messageId: message.correlation_id,
    });

  }
}