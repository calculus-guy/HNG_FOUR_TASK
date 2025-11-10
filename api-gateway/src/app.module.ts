import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { NotificationController } from "./controllers/notification.controller";
import { HealthController } from "./controllers/health.controller";
import { NotificationService } from "./services/notification.service";
import { RabbitMQProvider } from "./queues/rabbitmq.provider";
import { RedisService } from "./services/redis.service";
import { UserGrpcClient } from "./clients/user-grpc.client";
import { TemplateGrpcClient } from "./clients/template-grpc.client";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || "60", 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
      },
    ]),
  ],
  controllers: [NotificationController, HealthController],
  providers: [
    NotificationService,
    RabbitMQProvider,
    RedisService,
    UserGrpcClient,
    TemplateGrpcClient,
  ],
})
export class AppModule {}
