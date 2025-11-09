import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RabbitMQProvider } from "../queues/rabbitmq.provider";
import { RedisService } from "../services/redis.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly rabbitMQ: RabbitMQProvider,
    private readonly redis: RedisService
  ) {}

  @Get()
  @ApiOperation({ summary: "Check service health" })
  async checkHealth() {
    const checks = {
      service: "api-gateway",
      status: "healthy",
      timestamp: new Date().toISOString(),
      dependencies: {
        rabbitmq: await this.checkRabbitMQ(),
        redis: await this.checkRedis(),
      },
    };

    const isHealthy = Object.values(checks.dependencies).every(
      (dep) => dep.status === "healthy"
    );

    return {
      success: isHealthy,
      data: checks,
      message: isHealthy
        ? "All systems operational"
        : "Some dependencies are down",
    };
  }

  private async checkRabbitMQ() {
    try {
      const connected = this.rabbitMQ.isConnected();
      return {
        status: connected ? "healthy" : "unhealthy",
        message: connected ? "Connected" : "Disconnected",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: error.message,
      };
    }
  }

  private async checkRedis() {
    try {
      await this.redis.ping();
      return {
        status: "healthy",
        message: "Connected",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: error.message,
      };
    }
  }
}
