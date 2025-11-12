// src/controllers/metrics.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RedisService } from '../services/redis.service';
import { EmailService } from '../services/email.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get service metrics', description: 'Retrieve various metrics about the email service performance' })
  @ApiResponse({ status: 200, description: 'Service metrics' })
  async getMetrics() {
    try {
      const redisMetrics = await this.redisService.getMetrics();
      const circuitBreakerState = this.emailService.getCircuitBreakerState();

      return {
        processed: 0, 
        failed: 0,
        queue_length: 0,
        circuit_breaker: circuitBreakerState?.state ?? 'UNKNOWN',
        emails_sent: redisMetrics?.emails_sent ?? 0,
        emails_failed: redisMetrics?.emails_failed ?? 0,
        template_cache_size: 0,
      };
    } catch (error) {
      return {
        processed: 0,
        failed: 0,
        queue_length: 0,
        circuit_breaker: 'UNKNOWN',
        emails_sent: 0,
        emails_failed: 0,
        template_cache_size: 0,
      };
    }
  }
}
