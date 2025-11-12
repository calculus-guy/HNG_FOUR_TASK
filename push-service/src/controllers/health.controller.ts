import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RabbitMQProvider } from '../queues/rabbitmq.provider';
import { PushService } from '../services/push.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly rabbitmqProvider: RabbitMQProvider,
    private readonly pushService: PushService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  getHealth() {
    const rabbitmqConnected = this.rabbitmqProvider.isConnected();
    const circuitBreaker = this.pushService.getCircuitBreakerStatus();

    const isHealthy = rabbitmqConnected && circuitBreaker.state !== 'OPEN';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        rabbitmq: {
          connected: rabbitmqConnected,
          status: rabbitmqConnected ? 'up' : 'down',
        },
        fcm: {
          circuit_breaker: circuitBreaker.state,
          failures: circuitBreaker.failures,
        },
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  getReadiness() {
    const rabbitmqConnected = this.rabbitmqProvider.isConnected();
    return {
      ready: rabbitmqConnected,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  getLiveness() {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }
}
