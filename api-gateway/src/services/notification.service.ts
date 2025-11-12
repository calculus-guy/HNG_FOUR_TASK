// src/services/notification.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { RedisService } from "./redis.service";
import { UserGrpcClient } from "../clients/user-grpc.client";
import { TemplateGrpcClient } from "../clients/template-grpc.client";
import { SendNotificationDto } from "../dto/send-notification.dto";
import { v4 as uuidv4 } from "uuid";
import { RabbitMQService } from "./rabbitmq.service";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
  meta?: any;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly rabbitMQ: RabbitMQService,
    private readonly redis: RedisService,
    private readonly userClient: UserGrpcClient,
    private readonly templateClient: TemplateGrpcClient
  ) {}

  async sendNotification(
    dto: SendNotificationDto,
    correlationId: string
  ): Promise<ApiResponse> {
    this.logger.log(`[${correlationId}] Processing notification request`);

    // Check idempotency
    const idempotencyKey = `notification:${dto.user_id}:${dto.template_id}:${dto.channel}`;
    const isDuplicate = await this.redis.checkIdempotency(idempotencyKey);
    if (isDuplicate) {
      this.logger.warn(`[${correlationId}] Duplicate notification request`);
      throw new BadRequestException("Duplicate notification request");
    }

    // Fetch user
    const user = await this.getUserWithCache(dto.user_id);
    if (!user) throw new NotFoundException(`User with ID ${dto.user_id} not found`);

    // Fetch template
    const template = await this.getTemplateWithCache(dto.template_id);
    if (!template)
      throw new NotFoundException(`Template with ID ${dto.template_id} not found`);

    // Check preferences
    if (!this.isChannelAllowed(user, dto.channel)) {
      throw new BadRequestException(`User has disabled ${dto.channel} notifications`);
    }

    // Build message
    const message = {
      id: uuidv4(),
      user_id: dto.user_id,
      channel: dto.channel,
      template_id: dto.template_id,
      context: dto.context || {},
      correlation_id: correlationId,
      retry_count: 0,
      created_at: new Date().toISOString(),
      user_data: { email: user.email, name: user.name, fcm_token: user.fcm_token },
      template_data: { subject: template.subject, body: template.body },
    };

    // Publish to RabbitMQ
    const routingKey =
      dto.channel === "email" ? "notification.email" : "notification.push";

    const published = await this.rabbitMQ.publishMessage(routingKey, message);
    if (!published) {
      this.logger.error(`[${correlationId}] Failed to publish message`);
      throw new Error("Failed to queue notification");
    }

    // Set idempotency
    await this.redis.setIdempotency(idempotencyKey, 86400);

    this.logger.log(`[${correlationId}] Notification queued successfully`);

    return {
      success: true,
      message: "Notification queued successfully",
      data: { correlation_id: correlationId, user_id: dto.user_id, channel: dto.channel },
    };
  }

  private async getUserWithCache(userId: string): Promise<any> {
    const cacheKey = `user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const user = await this.userClient.getUserById(userId);
    if (user) await this.redis.set(cacheKey, JSON.stringify(user), 300);
    return user;
  }

  private async getTemplateWithCache(templateId: string): Promise<any> {
    const cacheKey = `template:${templateId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const template = await this.templateClient.getTemplateById(templateId);
    if (template) await this.redis.set(cacheKey, JSON.stringify(template), 600);
    return template;
  }

  private isChannelAllowed(user: any, channel: string): boolean {
    if (!user.preferences) return true;
    if (channel === "email") return user.preferences.email_enabled !== false;
    if (channel === "push") return user.preferences.push_enabled !== false;
    return true;
  }
}
