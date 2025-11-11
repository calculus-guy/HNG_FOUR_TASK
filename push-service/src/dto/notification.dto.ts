import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsInt, Min, Max } from 'class-validator';

export enum NotificationStatus {
  DELIVERED = 'delivered',
  PENDING = 'pending',
  FAILED = 'failed',
}

export class PushNotificationDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: 'FCM device token',
    example: 'fcm-device-token-string',
  })
  @IsString()
  push_token: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Welcome to our platform',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification body',
    example: 'Thank you for signing up!',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    description: 'Notification icon URL',
    example: 'https://example.com/icon.png',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Notification image URL',
    example: 'https://example.com/image.png',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Click action URL',
    example: 'https://example.com/welcome',
  })
  @IsString()
  @IsOptional()
  click_action?: string;

  @ApiProperty({
    description: 'Unique request ID for idempotency',
    example: 'req-123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  request_id: string;

  @ApiPropertyOptional({
    description: 'Priority level (1-10)',
    example: 5,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { campaign_id: 'summer-2024' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class NotificationStatusDto {
  @ApiProperty({
    description: 'Notification ID',
    example: 'notif-123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  notification_id: string;

  @ApiProperty({
    description: 'Notification status',
    enum: NotificationStatus,
    example: NotificationStatus.DELIVERED,
  })
  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @ApiPropertyOptional({
    description: 'Timestamp of status update',
    example: '2024-11-11T10:30:00Z',
  })
  @IsString()
  @IsOptional()
  timestamp?: string;

  @ApiPropertyOptional({
    description: 'Error message if failed',
    example: 'Invalid device token',
  })
  @IsString()
  @IsOptional()
  error?: string;
}

export class MultipleDeviceNotificationDto {
  @ApiProperty({
    description: 'Array of FCM device tokens',
    example: ['token1', 'token2', 'token3'],
    type: [String],
  })
  tokens: string[];

  @ApiProperty({
    description: 'Notification title',
    example: 'New feature available',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification body',
    example: 'Check out our new feature!',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    description: 'Notification icon URL',
    example: 'https://example.com/icon.png',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class TopicNotificationDto {
  @ApiProperty({
    description: 'Topic name to send notification to',
    example: 'news-updates',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Breaking News',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification body',
    example: 'Important update for all users',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    description: 'Notification icon URL',
    example: 'https://example.com/icon.png',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
