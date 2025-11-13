import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: payload.email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const password_hash = await bcrypt.hash(payload.password, 10);
    const user = this.userRepository.create({
      email: payload.email,
      password_hash,
      full_name: payload.full_name,
    });

    await this.userRepository.save(user);

    return {
      message: 'User registered successfully',
      user_id: user.user_id,
      email: user.email,
    };
  }

  async login(payload: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: payload.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(payload.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.user_id,
      email: user.email,
      role: user.role,
    });

    return { access_token: token };
  }
}