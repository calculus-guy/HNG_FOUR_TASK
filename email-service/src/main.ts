import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { logger } from './utils/logger';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    trustProxy: true,
    bodyLimit: 1048576,
    pluginTimeout: 60000,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      logger: ['error', 'warn', 'log'],
      bufferLogs: true,
    }
  );

  // Setup Swagger documentation
  setupSwagger(app);

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  });

  const port = parseInt(process.env.PORT || '3003', 10);
  await app.listen(port, '0.0.0.0');
  
  logger.info(`Email Service started successfully on port ${port}`);
  logger.info(`Health check available at http://localhost:${port}/health`);
  logger.info(`Metrics available at http://localhost:${port}/metrics`);
  logger.info(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  logger.error('Failed to start Email Service', error);
  process.exit(1);
});