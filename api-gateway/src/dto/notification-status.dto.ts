import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationStatus {
  DELIVERED = 'delivered',
  PENDING = 'pending',
  FAILED = 'failed',
}

export class NotificationStatusDto {
  @ApiProperty({ example: 'req_a1bb48d2-659b-4131-9a1c-3e2dfef4b7ac' })
  @IsString()
  notification_id: string;

  @ApiProperty({ enum: NotificationStatus, example: NotificationStatus.DELIVERED })
  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  error?: string;
}
