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
import { StandardResponse, createResponse } from "../dto/standard-response.dto";
import { v4 as uuidv4 } from "uuid";
import { RabbitMQService } from "./rabbitmq.service";

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
    idempotencyKey?: string
  ): Promise<StandardResponse> {
    // Generate request_id if not provided
    const requestId = dto.request_id || `req_${uuidv4()}`;
    const correlationId = dto.correlation_id || uuidv4();
    
    this.logger.log(`[${correlationId}] Processing notification request: ${requestId}`);

    // Check idempotency using provided key or generate from request
    const effectiveIdempotencyKey = idempotencyKey || `notification:${dto.user_id}:${dto.template_code}:${dto.notification_type}:${requestId}`;
    const isDuplicate = await this.redis.checkIdempotency(effectiveIdempotencyKey);
    if (isDuplicate) {
      this.logger.warn(`[${correlationId}] Duplicate notification request: ${requestId}`);
      throw new BadRequestException("Duplicate notification request");
    }

    // Fetch user
    const user = await this.getUserWithCache(dto.user_id);
    if (!user) throw new NotFoundException(`User with ID ${dto.user_id} not found`);

    // Fetch template by code instead of ID
    const template = await this.getTemplateByCode(dto.template_code);
    if (!template)
      throw new NotFoundException(`Template with code ${dto.template_code} not found`);

    // Check preferences
    if (!this.isChannelAllowed(user, dto.notification_type)) {
      throw new BadRequestException(`User has disabled ${dto.notification_type} notifications`);
    }

    // Build message with new structure
    const message = {
      id: uuidv4(),
      request_id: requestId,
      user_id: dto.user_id,
      notification_type: dto.notification_type,
      template_code: dto.template_code,
      context: dto.context || {},
      priority: dto.priority || "medium",
      metadata: dto.metadata || {},
      correlation_id: correlationId,
      retry_count: 0,
      created_at: new Date().toISOString(),
      user_data: { 
        email: user.email, 
        name: user.name, 
        fcm_token: user.fcm_token,
        preferences: user.preferences 
      },
      template_data: { 
        subject: template.subject, 
        body: template.body,
        version: template.version 
      },
    };

    // Publish to RabbitMQ with updated routing
    const routingKey =
      dto.notification_type === "email" ? "notification.email" : "notification.push";

    const published = await this.rabbitMQ.publishMessage(routingKey, message);
    if (!published) {
      this.logger.error(`[${correlationId}] Failed to publish message`);
      throw new Error("Failed to queue notification");
    }

    // Set idempotency with 24-hour TTL
    await this.redis.setIdempotency(effectiveIdempotencyKey, 86400);

    this.logger.log(`[${correlationId}] Notification queued successfully: ${requestId}`);

    // Store initial status
    const statusKey = `notification:status:${requestId}`;
    await this.redis.set(
      statusKey,
      JSON.stringify({
        status: 'pending',
        timestamp: new Date().toISOString(),
        user_id: dto.user_id,
        notification_type: dto.notification_type,
      }),
      604800 // 7 days
    );

    return createResponse(
      true,
      "Notification queued successfully",
      { 
        request_id: requestId,
        correlation_id: correlationId, 
        user_id: dto.user_id, 
        notification_type: dto.notification_type,
        status: "pending",
        timestamp: new Date().toISOString()
      }
    );
  }

  private async getUserWithCache(userId: string): Promise<any> {
    const cacheKey = `user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      // Try gRPC first
      const user = await this.userClient.getUserById(userId);
      if (user) await this.redis.set(cacheKey, JSON.stringify(user), 300);
      return user;
    } catch (error) {
      // Fallback to REST API
      this.logger.warn(`gRPC failed, using REST API fallback: ${error.message}`);
      
      const userServiceUrl = process.env.USER_SERVICE_HOST || 'user-service';
      const userServicePort = process.env.USER_SERVICE_PORT || '4000';
      const url = `http://${userServiceUrl}:${userServicePort}/users/${userId}`;
      
      this.logger.log(`Fetching user from REST API: ${url}`);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          this.logger.error(`User service returned ${response.status}`);
          return null;
        }
        
        const data = await response.json();
        const user = data.data || data;
        
        if (user) {
          await this.redis.set(cacheKey, JSON.stringify(user), 300);
        }
        
        return user;
      } catch (fetchError) {
        this.logger.error(`Failed to fetch user via REST: ${fetchError.message}`);
        return null;
      }
    }
  }

  private async getTemplateByCode(templateCode: string): Promise<any> {
    const cacheKey = `template:code:${templateCode}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Use REST API directly (gRPC getTemplateByCode not implemented yet)
    const templateServiceUrl = process.env.TEMPLATE_SERVICE_HOST || 'template-service';
    const templateServicePort = process.env.TEMPLATE_SERVICE_PORT || '4002';
    const url = `http://${templateServiceUrl}:${templateServicePort}/api/v1/templates/by-name/${templateCode}`;
    
    this.logger.log(`Fetching template from REST API: ${url}`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.error(`Template service returned ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      const template = data.data || data;
      
      if (template) {
        await this.redis.set(cacheKey, JSON.stringify(template), 600);
      }
      
      return template;
    } catch (error) {
      this.logger.error(`Failed to fetch template via REST: ${error.message}`);
      return null;
    }
  }

  private isChannelAllowed(user: any, notificationType: string): boolean {
    if (!user.preferences) return true;
    if (notificationType === "email") return user.preferences.email_enabled !== false;
    if (notificationType === "push") return user.preferences.push_enabled !== false;
    return true;
  }
}
