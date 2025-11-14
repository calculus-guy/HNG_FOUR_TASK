import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
  Get,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { NotificationService } from "../services/notification.service";
import { SendNotificationDto } from "../dto/send-notification.dto";

export interface PaginationMeta {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
}

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  meta?: PaginationMeta | Record<string, any>;
}

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(ThrottlerGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({ summary: "Send a notification (alias of /send)" })
  @ApiHeader({
    name: 'x-idempotency-key',
    description: 'Idempotency key to prevent duplicate requests',
    required: false,
  })
  @ApiResponse({ status: 202, description: "Notification request accepted and queued" })
  async sendNotificationAlias(
    @Body() dto: SendNotificationDto,
    @Headers('x-idempotency-key') idempotencyKey?: string
  ): Promise<StandardApiResponse> {
    return this.notificationService.sendNotification(dto, idempotencyKey);
  }

  @Post("send")
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({ summary: "Send a notification to a user" })
  @ApiHeader({
    name: 'x-idempotency-key',
    description: 'Idempotency key to prevent duplicate requests',
    required: false,
  })
  @ApiResponse({
    status: 202,
    description: "Notification request accepted and queued",
    schema: {
      example: {
        success: true,
        message: "Notification queued successfully",
        data: {
          request_id: "req_c1f7a4f0-40e1-4b1a-8fc3",
          user_id: "c1f7a4f0-40e1-4b1a-8fc3-2e7a3b8d6f9e",
          notification_type: "email",
          status: "queued"
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "User or template not found" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async sendNotification(
    @Body() dto: SendNotificationDto,
    @Headers('x-idempotency-key') idempotencyKey?: string
  ): Promise<StandardApiResponse> {
    return this.notificationService.sendNotification(dto, idempotencyKey);
  }

  @Get("health")
  @ApiOperation({ summary: "Health check for API Gateway" })
  @ApiResponse({
    status: 200,
    description: "API Gateway is healthy",
  })
  async healthCheck(): Promise<StandardApiResponse> {
    return {
      success: true,
      message: "API Gateway is healthy",
      data: {
        service: "api-gateway",
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    };
  }
}