// src/controllers/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import { RedisService } from '../services/redis.service';
import { RabbitMQProvider } from '../queues/rabbitmq.provider';
import { EmailConsumer } from '../consumer/email.consumer';
import { logger } from '../utils/logger';

@ApiTags('health')
@Controller('email/health')
export class HealthController {
  constructor(
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly rabbitMQProvider: RabbitMQProvider,
    private readonly emailConsumer: EmailConsumer,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Check the health status of the email service and its dependencies' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async healthCheck() {
    const checks: Record<string, any> = {
      redis: { status: 'unknown' },
      smtp: { status: 'unknown' },
      rabbitmq: { status: 'unknown' },
      consumer: { status: 'unknown' },
    };

    try {
      // Redis
      const redisHealthy = await this.redisService.healthCheck();
      checks.redis = { status: redisHealthy ? 'healthy' : 'unhealthy' };

      // SMTP / email service
      const smtpHealth = await this.emailService.healthCheck();
      checks.smtp = {
        status: smtpHealth?.status ?? 'unhealthy',
        details: smtpHealth?.details ?? null,
      };

      // RabbitMQ
      const rabbitConnected = this.rabbitMQProvider.isConnected();
      checks.rabbitmq = { status: rabbitConnected ? 'healthy' : 'unhealthy' };

      // Consumer
      const consumerRunning = this.emailConsumer.isRunning();
      checks.consumer = { status: consumerRunning ? 'healthy' : 'unhealthy' };

      const allHealthy = Object.values(checks).every((c: any) => c.status === 'healthy');

      const response = {
        status: allHealthy ? 'healthy' : 'unhealthy',
        service: 'email-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks,
      };

      if (!allHealthy) {
        logger.warn('Health check reported unhealthy', { checks });
      }

      return response;
    } catch (error) {
      logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        service: 'email-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks,
      };
    }
  }
}
