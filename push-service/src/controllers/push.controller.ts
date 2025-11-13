import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PushService } from '../services/push.service';
import { 
  PushNotificationDto, 
  MultipleDeviceNotificationDto, 
  TopicNotificationDto 
} from '../dto/notification.dto';

@ApiTags('Push Notifications')
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send push notification to a single device' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification sent successfully',
    schema: {
      example: {
        success: true,
        message: 'Push notification sent successfully',
        message_id: 'projects/push-service-2a2ab/messages/1234567890'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request data' 
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Circuit breaker is open - service temporarily unavailable' 
  })
  async sendPushNotification(@Body() dto: PushNotificationDto) {
    return await this.pushService.sendPushNotification(dto);
  }

  @Post('send-multiple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send push notification to multiple devices' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notifications sent successfully',
    schema: {
      example: {
        success: true,
        message: 'Push notifications sent to 3 devices',
        results: {
          successful: 2,
          failed: 1,
          details: []
        }
      }
    }
  })
  async sendToMultipleDevices(@Body() dto: MultipleDeviceNotificationDto) {
    return await this.pushService.sendToMultipleDevices(dto);
  }

  @Post('send-topic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send push notification to a topic' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification sent to topic successfully',
    schema: {
      example: {
        success: true,
        message: 'Push notification sent to topic: breaking-news',
        message_id: 'projects/push-service-2a2ab/messages/1234567890'
      }
    }
  })
  async sendToTopic(@Body() dto: TopicNotificationDto) {
    return await this.pushService.sendToTopic(dto);
  }
}
