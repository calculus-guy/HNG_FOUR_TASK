import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationStatusDto } from '../dto/notification-status.dto';
import { StandardResponse, createResponse } from '../dto/standard-response.dto';
import { RedisService } from '../services/redis.service';

@ApiTags('notification-status')
@Controller('notifications')
export class NotificationStatusController {
  constructor(private readonly redis: RedisService) {}

  @Post('status')
  @ApiOperation({ summary: 'Update notification status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(@Body() dto: NotificationStatusDto): Promise<StandardResponse> {
    // Store status in Redis with TTL of 7 days
    const statusKey = `notification:status:${dto.notification_id}`;
    await this.redis.set(
      statusKey,
      JSON.stringify({
        status: dto.status,
        timestamp: dto.timestamp || new Date().toISOString(),
        error: dto.error,
      }),
      604800 // 7 days
    );

    return createResponse(
      true,
      'Notification status updated successfully',
      { notification_id: dto.notification_id, status: dto.status }
    );
  }

  @Get('status/:notification_id')
  @ApiOperation({ summary: 'Get notification status' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getStatus(@Param('notification_id') notificationId: string): Promise<StandardResponse> {
    const statusKey = `notification:status:${notificationId}`;
    const statusData = await this.redis.get(statusKey);

    if (!statusData) {
      return createResponse(false, 'Notification not found', null, 'Notification status not found');
    }

    const status = JSON.parse(statusData);
    return createResponse(true, 'Notification status retrieved successfully', {
      notification_id: notificationId,
      ...status,
    });
  }
}
