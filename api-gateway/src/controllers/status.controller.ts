import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RedisService } from '../services/redis.service';

class StatusDto {
  notification_id: string;
  status: 'delivered' | 'pending' | 'failed';
  timestamp?: string;
  error?: string;
}

@ApiTags('status')
@Controller()
export class StatusController {
  constructor(private readonly redis: RedisService) {}

  @Post('email/status')
  @ApiOperation({ summary: 'Report email notification status' })
  @ApiResponse({ status: 200, description: 'Status recorded' })
  async emailStatus(@Body() dto: StatusDto) {
    const key = `notification:status:${dto.notification_id}`;
    const payload = {
      channel: 'email',
      status: dto.status,
      error: dto.error || null,
      timestamp: dto.timestamp || new Date().toISOString(),
    };
    await this.redis.set(key, JSON.stringify(payload), 604800);
    return { success: true, data: payload };
  }

  @Post('push/status')
  @ApiOperation({ summary: 'Report push notification status' })
  @ApiResponse({ status: 200, description: 'Status recorded' })
  async pushStatus(@Body() dto: StatusDto) {
    const key = `notification:status:${dto.notification_id}`;
    const payload = {
      channel: 'push',
      status: dto.status,
      error: dto.error || null,
      timestamp: dto.timestamp || new Date().toISOString(),
    };
    await this.redis.set(key, JSON.stringify(payload), 604800);
    return { success: true, data: payload };
  }
}
