// src/services/rabbitmq.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: amqp.ChannelWrapper;

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672';
    this.connection = amqp.connect([url]);

    this.connection.on('connect', () => this.logger.log('✅ RabbitMQ connected'));
    this.connection.on('disconnect', (err) =>
      this.logger.error('❌ RabbitMQ disconnected', err?.err?.message),
    );

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel) => channel.assertExchange('notifications.direct', 'direct', { durable: true }),
    });
  }

  async publishMessage(routingKey: string, message: any): Promise<boolean> {
    try {
      await this.channelWrapper.publish('notifications.direct', routingKey, message);
      this.logger.log(`📨 Published message to ${routingKey}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to publish message: ${err.message}`);
      return false;
    }
  }

  isConnected(): boolean {
    return !!this.connection && this.connection.isConnected();
  }

  async onModuleDestroy() {
    if (this.connection) await this.connection.close();
  }
}
