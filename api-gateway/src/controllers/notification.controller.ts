import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { NotificationService } from "../services/notification.service";
import { SendNotificationDto } from "../dto/send-notification.dto";
import { CorrelationId } from "../decorators/correlation-id.decorator";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(ThrottlerGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post("send")
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Send a notification to a user" })
  @ApiResponse({
    status: 202,
    description: "Notification request accepted and queued",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "User or template not found" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async sendNotification(
    @Body() dto: SendNotificationDto,
    @CorrelationId() correlationId: string
  ) {
    await this.notificationService.sendNotification(dto, correlationId);

    return {
      success: true,
      message: "Notification request received and is being processed",
      data: {
        correlation_id: correlationId,
        status: "queued",
      },
    };
  }
}
