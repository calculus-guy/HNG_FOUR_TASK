import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './controllers/health.controller';
import { PushController } from './controllers/push.controller';
import { PushService } from './services/push.service';
import { PushConsumer } from './consumer/push.consumer';
import { RabbitMQProvider } from './queues/rabbitmq.provider';
import { FirebaseAdmin } from '../utils/fcm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController, HealthController, PushController],
  providers: [
    AppService,
    PushService,
    PushConsumer,
    RabbitMQProvider,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        return FirebaseAdmin.initialize();
      },
    },
  ],
})
export class AppModule {}
