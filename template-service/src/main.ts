import { NestFactory, HttpAdapterHost } from '@nestjs/core'
import { TemplateModule } from './template.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../shared/filters/all-exceptions.filter';

async function bootstrap() {
    const PORT_HTTP = process.env.PORT_HTTP || 3002;
    const PORT_GRPC = process.env.PORT_GRPC || 50052;

    // 1. Setup HTTP/REST server
    const app = await NestFactory.create(TemplateModule);

    const { httpAdapter } = app.get(HttpAdapterHost);

    app.setGlobalPrefix('api/v1');

    app.useGlobalFilters(new AllExceptionsFilter());

    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));

    // Swagger Documentation
    const config = new DocumentBuilder()
        .setTitle('Template Service')
        .setDescription('Template management and versioning microservice')
        .setVersion('1.0')
        .addTag('templates')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // 2. Setup gRPC microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            url: `0.0.0.0:${PORT_GRPC}`,
            package: 'template',
            protoPath: 'src/template.proto',
        },
    });

    await app.startAllMicroservices();
    await app.listen(PORT_HTTP);

    console.log(`Template Service (HTTP) running on port: ${PORT_HTTP}`);
    console.log(`Template Service (gRPC) running on port: ${PORT_GRPC}`);
}
bootstrap();