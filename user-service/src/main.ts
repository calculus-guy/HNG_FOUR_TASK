import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Enable CORS
  app.enableCors();

  // Correlation ID middleware
  app.use((req, res, next) => {
    req.correlation_id = uuidv4();
    res.setHeader('x-correlation-id', req.correlation_id);
    next();
  });

  // Morgan request logger
  app.use(
    morgan(':method :url :status - :response-time ms :res[x-correlation-id]', {
      stream: {
        write: (message) => console.log(message.trim()),
      },
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global guards (JWT + Roles)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('User authentication and management service for distributed notification system')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('health', 'Health check endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`[USER_SERVICE] running on port ${port}`);
  console.log(`[USER_SERVICE] Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();