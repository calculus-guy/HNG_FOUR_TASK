import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Public } from '../../common/decorators/public.decorator';
import { UpdateUserPreferencesDto, UpdatePushTokenDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { success: true, data: user, message: 'User retrieved successfully' };
  }

  @Patch(':id/preferences')
  @Public()
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserPreferencesDto })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePreferences(
    @Param('id') id: string,
    @Body() dto: UpdateUserPreferencesDto,
  ) {
    const user = await this.usersService.updatePreferences(id, dto);
    return { success: true, data: user, message: 'Preferences updated successfully' };
  }

  @Patch(':id/push-token')
  @Public()
  @ApiOperation({ summary: 'Update user push notification token' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdatePushTokenDto })
  @ApiResponse({ status: 200, description: 'Push token updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePushToken(
    @Param('id') id: string,
    @Body() dto: UpdatePushTokenDto,
  ) {
    const user = await this.usersService.updatePushToken(id, dto.push_token);
    return { success: true, data: user, message: 'Push token updated successfully' };
  }
}
