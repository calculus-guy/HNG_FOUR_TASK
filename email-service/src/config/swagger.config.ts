import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Email Service API')
    .setDescription('Microservice for handling email notifications in the distributed notification system')
    .setVersion('1.0')
    .addTag('email', 'Email notification endpoints')
    .addTag('health', 'Health check endpoints')
    .addTag('metrics', 'Service metrics endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Email Service API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}