import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { NotificationController } from "./controllers/notification.controller";
import { HealthController } from "./controllers/health.controller";
import { NotificationStatusController } from "./controllers/notification-status.controller";
import { StatusController } from "./controllers/status.controller";
import { NotificationService } from "./services/notification.service";
import { RedisService } from "./services/redis.service";
import { UserGrpcClient } from "./clients/user-grpc.client";
import { TemplateGrpcClient } from "./clients/template-grpc.client";
import { RabbitMQService } from "./services/rabbitmq.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || "60000", 10),
        limit: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
      },
    ]),
  ],
  controllers: [NotificationController, HealthController, NotificationStatusController, StatusController],
  providers: [
    NotificationService,
    RabbitMQService,
    RedisService,
    UserGrpcClient,
    TemplateGrpcClient,
  ],
})
export class AppModule {}
