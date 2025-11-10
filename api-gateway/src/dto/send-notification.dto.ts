import {
  IsString,
  IsEnum,
  IsUUID,
  IsObject,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum NotificationChannel {
  EMAIL = "email",
  PUSH = "push",
}

export class SendNotificationDto {
  @ApiProperty({
    description: "User ID to send notification to",
    example: "c1f7a4f0-40e1-4b1a-8fc3-2e7a3b8d6f9e",
  })
  @IsUUID("4")
  user_id: string;

  @ApiProperty({
    description: "Notification channel",
    enum: NotificationChannel,
    example: "email",
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({
    description: "Template ID to use for the notification",
    example: "a2b3c4d5-e6f7-4a8b-9c1d-0e9f8a7b6c5d",
  })
  @IsUUID("4")
  template_id: string;

  @ApiProperty({
    description: "Context variables for template substitution",
    example: { name: "John Doe", action: "verify email" },
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}
