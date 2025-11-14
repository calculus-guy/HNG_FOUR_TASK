import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserPreferenceDto {
  @ApiProperty({ example: true, description: 'Enable email notifications' })
  @IsBoolean()
  email!: boolean;

  @ApiProperty({ example: true, description: 'Enable push notifications' })
  @IsBoolean()
  push!: boolean;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', description: 'User password (minimum 6 characters)' })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 'fcm-token-123...', description: 'Firebase Cloud Messaging push token' })
  @IsOptional()
  @IsNotEmpty()
  push_token?: string;

  @ApiProperty({ type: UserPreferenceDto, description: 'User notification preferences' })
  @ValidateNested()
  @Type(() => UserPreferenceDto)
  preferences!: UserPreferenceDto;
}