import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { RabbitMQProvider } from "../queues/rabbitmq.provider";
import { RedisService } from "./redis.service";
import { UserGrpcClient } from "../clients/user-grpc.client";
import { TemplateGrpcClient } from "../clients/template-grpc.client";
import { SendNotificationDto } from "../dto/send-notification.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly rabbitMQ: RabbitMQProvider,
    private readonly redis: RedisService,
    private readonly userClient: UserGrpcClient,
    private readonly templateClient: TemplateGrpcClient
  ) {}

  async sendNotification(dto: SendNotificationDto, correlationId: string) {
    this.logger.log(`[${correlationId}] Processing notification request`);

    // Check for idempotency
    const idempotencyKey = `notification:${dto.user_id}:${dto.template_id}:${dto.channel}`;
    const isDuplicate = await this.redis.checkIdempotency(idempotencyKey);

    if (isDuplicate) {
      this.logger.warn(
        `[${correlationId}] Duplicate notification request detected`
      );
      throw new BadRequestException("Duplicate notification request");
    }

    // Verify user exists (with caching)
    const user = await this.getUserWithCache(dto.user_id);
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found`);
    }

    // Verify template exists (with caching)
    const template = await this.getTemplateWithCache(dto.template_id);
    if (!template) {
      throw new NotFoundException(
        `Template with ID ${dto.template_id} not found`
      );
    }

    // Check user preferences
    if (!this.isChannelAllowed(user, dto.channel)) {
      throw new BadRequestException(
        `User has disabled ${dto.channel} notifications`
      );
    }

    // Create notification message
    const message = {
      id: uuidv4(),
      user_id: dto.user_id,
      channel: dto.channel,
      template_id: dto.template_id,
      context: dto.context || {},
      correlation_id: correlationId,
      retry_count: 0,
      created_at: new Date().toISOString(),
      user_data: {
        email: user.email,
        name: user.name,
        fcm_token: user.fcm_token,
      },
      template_data: {
        subject: template.subject,
        body: template.body,
      },
    };

    // Publish to appropriate queue
    const routingKey =
      dto.channel === "email" ? "notification.email" : "notification.push";

    const published = await this.rabbitMQ.publishMessage(routingKey, message);

    if (!published) {
      this.logger.error(
        `[${correlationId}] Failed to publish message to queue`
      );
      throw new Error("Failed to queue notification");
    }

    // Set idempotency key with expiration (24 hours)
    await this.redis.setIdempotency(idempotencyKey, 86400);

    this.logger.log(`[${correlationId}] Notification queued successfully`);
  }

  private async getUserWithCache(userId: string): Promise<any> {
    const cacheKey = `user:${userId}`;

    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from user service via gRPC
    const user = await this.userClient.getUserById(userId);

    if (user) {
      // Cache for 5 minutes
      await this.redis.set(cacheKey, JSON.stringify(user), 300);
    }

    return user;
  }

  private async getTemplateWithCache(templateId: string): Promise<any> {
    const cacheKey = `template:${templateId}`;

    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from template service via gRPC
    const template = await this.templateClient.getTemplateById(templateId);

    if (template) {
      // Cache for 10 minutes
      await this.redis.set(cacheKey, JSON.stringify(template), 600);
    }

    return template;
  }

  private isChannelAllowed(user: any, channel: string): boolean {
    if (!user.preferences) {
      return true; // Allow all channels by default
    }

    if (channel === "email") {
      return user.preferences.email_enabled !== false;
    }

    if (channel === "push") {
      return user.preferences.push_enabled !== false;
    }

    return true;
  }
}
