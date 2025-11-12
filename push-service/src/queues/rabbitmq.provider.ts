import * as amqplib from 'amqplib';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RabbitMQProvider implements OnModuleInit, OnModuleDestroy {
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;
  private readonly logger = new Logger(RabbitMQProvider.name);
  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  private readonly EXCHANGE_NAME = 'notifications.direct';
  private readonly PUSH_QUEUE = 'push.queue';
  private readonly FAILED_QUEUE = 'failed.queue';
  private readonly MAX_RETRIES = 3;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly RECONNECT_DELAY = 5000;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      this.logger.log(`Connecting to RabbitMQ at ${this.RABBITMQ_URL}...`);
      
      const connection = await amqplib.connect(this.RABBITMQ_URL);
      this.connection = connection as any;
      
      const channel = await connection.createChannel();
      this.channel = channel;

      connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
        this.handleConnectionError();
      });

      connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.handleConnectionError();
      });

      await channel.assertExchange(this.EXCHANGE_NAME, 'direct', {
        durable: true,
      });

      await channel.assertQueue(this.PUSH_QUEUE, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': this.EXCHANGE_NAME,
          'x-dead-letter-routing-key': 'failed',
          'x-message-ttl': 3600000,
        },
      });

      await channel.assertQueue(this.FAILED_QUEUE, {
        durable: true,
      });

      await channel.bindQueue(this.PUSH_QUEUE, this.EXCHANGE_NAME, 'push');
      await channel.bindQueue(this.FAILED_QUEUE, this.EXCHANGE_NAME, 'failed');

      channel.prefetch(1);

      this.reconnectAttempts = 0;
      this.logger.log('RabbitMQ connection established successfully');
    } catch (error: any) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      this.handleConnectionError();
    }
  }

  private handleConnectionError(): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      this.logger.log(
        `Attempting to reconnect to RabbitMQ (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`,
      );
      
      setTimeout(() => {
        this.connect();
      }, this.RECONNECT_DELAY);
    } else {
      this.logger.error('Max reconnection attempts reached. Please check RabbitMQ server.');
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await (this.connection as any).close();
      }
      this.logger.log('RabbitMQ connection closed');
    } catch (error: any) {
      this.logger.error(`Error closing RabbitMQ connection: ${error.message}`);
    }
  }

  async publishMessage(
    routingKey: string,
    message: any,
    options?: amqplib.Options.Publish,
  ): Promise<boolean> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel is not available');
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.publish(
        this.EXCHANGE_NAME,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now(),
          ...options,
        },
      );

      if (result) {
        this.logger.log(`Message published to ${routingKey}`);
      } else {
        this.logger.warn(`Failed to publish message to ${routingKey}`);
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Error publishing message: ${error.message}`);
      throw error;
    }
  }

  async consumeMessages(
    queue: string,
    onMessage: (msg: amqplib.ConsumeMessage) => Promise<void>,
  ): Promise<void> {
    try {
      // Wait for connection if not ready
      if (!this.channel) {
        this.logger.warn('Channel not ready, waiting for connection...');
        await this.waitForConnection();
      }

      if (!this.channel) {
        throw new Error('RabbitMQ channel is not available after waiting');
      }

      await this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              await onMessage(msg);
              this.channel!.ack(msg);
            } catch (error: any) {
              this.logger.error(`Error processing message: ${error.message}`);
              await this.handleFailedMessage(msg);
            }
          }
        },
        {
          noAck: false,
        },
      );

      this.logger.log(`Started consuming messages from ${queue}`);
    } catch (error: any) {
      this.logger.error(`Error consuming messages: ${error.message}`);
      throw error;
    }
  }

  private async waitForConnection(maxWaitTime: number = 30000): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 500; // Check every 500ms

    while (!this.channel && Date.now() - startTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    if (!this.channel) {
      throw new Error(
        `RabbitMQ connection not established within ${maxWaitTime}ms. Please ensure RabbitMQ is running.`,
      );
    }
  }

  private async handleFailedMessage(msg: amqplib.ConsumeMessage): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel is not available');
      }

      const retryCount = this.getRetryCount(msg);
      
      if (retryCount < this.MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000;
        this.logger.log(
          `Retrying message (attempt ${retryCount + 1}/${this.MAX_RETRIES}) after ${delay}ms`,
        );

        setTimeout(() => {
          if (this.channel) {
            this.channel.publish(
              this.EXCHANGE_NAME,
              'push',
              msg.content,
              {
                persistent: true,
                headers: {
                  ...msg.properties.headers,
                  'x-retry-count': retryCount + 1,
                },
              },
            );
            this.channel.ack(msg);
          }
        }, delay);
      } else {
        this.logger.error(
          `Message failed after ${this.MAX_RETRIES} retries. Moving to failed queue.`,
        );
        this.channel.nack(msg, false, false);
      }
    } catch (error: any) {
      this.logger.error(`Error handling failed message: ${error.message}`);
      if (this.channel) {
        this.channel.nack(msg, false, true);
      }
    }
  }

  private getRetryCount(msg: amqplib.ConsumeMessage): number {
    if (msg.properties.headers && msg.properties.headers['x-retry-count']) {
      return parseInt(msg.properties.headers['x-retry-count'], 10);
    }
    return 0;
  }

  getChannel(): amqplib.Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available');
    }
    return this.channel;
  }

  isConnected(): boolean {
    return !!this.connection && !!this.channel;
  }

  async getQueueInfo(queueName: string): Promise<amqplib.Replies.AssertQueue> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel is not available');
      }
      return await this.channel.checkQueue(queueName);
    } catch (error: any) {
      this.logger.error(`Error getting queue info: ${error.message}`);
      throw error;
    }
  }
}
