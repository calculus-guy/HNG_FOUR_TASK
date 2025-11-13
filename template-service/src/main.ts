import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { TemplateModule } from './template.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../shared/filters/all-exceptions.filter';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
    const PORT_HTTP = process.env.PORT || 4002;
    const PORT_GRPC = process.env.GRPC_PORT || 50052;


    const app = await NestFactory.create(TemplateModule);

    app.enableShutdownHooks();

    app.setGlobalPrefix('api/v1');

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Swagger setup
    const config = new DocumentBuilder()
        .setTitle('Template Service')
        .setDescription('Template management and versioning microservice')
        .setVersion('1.0')
        .addTag('templates')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Connect gRPC microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            url: `0.0.0.0:${PORT_GRPC}`,
            package: 'template',
            protoPath: 'src/template.proto',
        },
    });

    // Start services
    await app.startAllMicroservices();
    await app.listen(PORT_HTTP);

    console.log(`Template Service (HTTP) running on port: ${PORT_HTTP}`);
    console.log(`Template Service (gRPC) running on port: ${PORT_GRPC}`);
    console.log(`Swagger docs available at: http://localhost:${PORT_HTTP}/api/docs`);
}

bootstrap();
