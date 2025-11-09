import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";

@Injectable()
export class RabbitMQProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQProvider.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly exchangeName = "notifications.direct";

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const url = this.configService.get<string>("RABBITMQ_URL");
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Setup exchange and queues
      await this.setupExchangeAndQueues();

      this.logger.log("✅ Connected to RabbitMQ");

      // Handle connection errors
      this.connection.on("error", (err) => {
        this.logger.error("RabbitMQ connection error:", err);
      });

      this.connection.on("close", () => {
        this.logger.warn("RabbitMQ connection closed");
      });
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  private async setupExchangeAndQueues() {
    // Create exchange
    await this.channel.assertExchange(this.exchangeName, "direct", {
      durable: true,
    });

    // Create queues
    const queues = [
      { name: "email.queue", routingKey: "notification.email" },
      { name: "push.queue", routingKey: "notification.push" },
      { name: "failed.queue", routingKey: "notification.failed" },
    ];

    for (const queue of queues) {
      await this.channel.assertQueue(queue.name, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": this.exchangeName,
          "x-dead-letter-routing-key": "notification.failed",
        },
      });

      await this.channel.bindQueue(
        queue.name,
        this.exchangeName,
        queue.routingKey
      );
    }

    this.logger.log("✅ RabbitMQ exchanges and queues configured");
  }

  async publishMessage(routingKey: string, message: any): Promise<boolean> {
    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));

      return this.channel.publish(
        this.exchangeName,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          contentType: "application/json",
          timestamp: Date.now(),
        }
      );
    } catch (error) {
      this.logger.error(`Failed to publish message: ${error.message}`);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connection !== undefined && this.channel !== undefined;
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log("Disconnected from RabbitMQ");
    } catch (error) {
      this.logger.error("Error disconnecting from RabbitMQ:", error);
    }
  }
}
