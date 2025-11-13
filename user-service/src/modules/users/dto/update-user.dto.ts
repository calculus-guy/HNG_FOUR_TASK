import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPreferencesDto {
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  push?: boolean;
}

export class UpdatePushTokenDto {
  @ApiProperty({ example: 'fcm-device-token-here' })
  @IsString()
  push_token: string;
}
