import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsEnum, IsObject, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export enum NotificationType {
  EMAIL = "email",
  PUSH = "push",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export class SendNotificationDto {
  @ApiProperty({
    description: "Unique request identifier for idempotency",
    example: "req_c1f7a4f0-40e1-4b1a-8fc3-2e7a3b8d6f9e",
    required: false,
  })
  @IsOptional()
  @IsString()
  request_id?: string;

  @ApiProperty({
    description: "User ID to send notification to",
    example: "c1f7a4f0-40e1-4b1a-8fc3-2e7a3b8d6f9e",
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: "Type of notification to send",
    enum: NotificationType,
    example: "email",
  })
  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @ApiProperty({
    description: "Template code/identifier to use for the notification",
    example: "WELCOME_EMAIL",
  })
  @IsString()
  template_code: string;

  @ApiProperty({
    description: "Context variables for template substitution",
    example: { name: "John Doe", action: "verify email", link: "https://example.com/verify" },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @ApiProperty({
    description: "Priority level for notification delivery",
    enum: NotificationPriority,
    example: "medium",
    required: false,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiProperty({
    description: "Additional metadata for tracking and analytics",
    example: { campaign_id: "summer_promo", source: "web_app" },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  correlation_id?: string;
}
