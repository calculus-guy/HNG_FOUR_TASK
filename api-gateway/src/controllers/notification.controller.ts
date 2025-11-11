import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { NotificationService } from "../services/notification.service";
import { SendNotificationDto } from "../dto/send-notification.dto";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
  meta?: any;
}

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(ThrottlerGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "User or template not found" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async sendNotification(
    @Body() dto: SendNotificationDto,
    @Headers('x-idempotency-key') idempotencyKey?: string
  ): Promise<ApiResponse> {
    return this.notificationService.sendNotification(dto, idempotencyKey);
  }

  @Post("health")
  @ApiOperation({ summary: "Health check for API Gateway" })
  @ApiResponse({
    status: 200,
    description: "API Gateway is healthy",
  })
  async healthCheck(): Promise<ApiResponse> {
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