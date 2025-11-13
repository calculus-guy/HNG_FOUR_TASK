import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { UpdateUserPreferencesDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(userId: string) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Return user without password_hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updatePreferences(userId: string, dto: UpdateUserPreferencesDto) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update preferences
    user.preferences = {
      ...user.preferences,
      ...(dto.email !== undefined && { email_enabled: dto.email }),
      ...(dto.push !== undefined && { push_enabled: dto.push }),
    };

    await this.userRepository.save(user);

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updatePushToken(userId: string, pushToken: string) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.fcm_token = pushToken;
    await this.userRepository.save(user);

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
