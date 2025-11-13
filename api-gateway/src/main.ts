import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";
import { TransformInterceptor } from "./interceptors/transform.interceptor";
import fastifyHelmet from "@fastify/helmet";
import fastifyCors from "@fastify/cors";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const fastifyAdapter = new FastifyAdapter({
    logger: true,
    trustProxy: true,
    bodyLimit: 1048576, // 1MB
  });

  const app = (await NestFactory.create(
    AppModule,
    fastifyAdapter as any,
  )) as unknown as NestFastifyApplication;

  // Register security plugins
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, "data:", "validator.swagger.io"],
        scriptSrc: [`'self'`, `'unsafe-inline'`],
      },
    },
  });

  // Register CORS
  await app.register(fastifyCors as any, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Idempotency-Key",
      "X-Correlation-ID",
    ],
  });

  app.setGlobalPrefix("api/v1");

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Distributed Notification System API")
    .setDescription(
      "API Gateway for managing notifications across multiple channels",
    )
    .setVersion("1.0")
    .addTag("notifications")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup("api/docs", app as any, document, {
    explorer: true,
    customSiteTitle: "Notification System API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      deepLinking: true,
      displayRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  logger.log(`API Gateway running on: http://localhost:${port}`);
  logger.log(`Swagger Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
