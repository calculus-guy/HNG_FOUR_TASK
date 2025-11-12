import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthController } from './controllers/health.controller';
import { MetricsController } from './controllers/metrics.controller';
import { RabbitMQProvider } from './queues/rabbitmq.provider';
import { EmailService } from './services/email.service';
import { TemplateService } from './services/template.service';
import { RedisService } from './services/redis.service';
import emailConfig from './config/email.config';
import { EmailConsumer } from './consumer/email.consumer';
import { createClient } from 'redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [emailConfig],
      isGlobal: true,
    }),
  ],
  controllers: [HealthController, MetricsController],
  providers: [
    RabbitMQProvider,
    EmailService,
    TemplateService,
    RedisService,
    EmailConsumer,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('email.redis');
        
        const client = createClient({
          socket: {
            host: redisConfig.host,
            port: redisConfig.port,
          },
        });

        client.on('error', (err) => console.log('Redis Client Error', err));
        client.on('connect', () => console.log('Redis Client Connected'));
        
        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}