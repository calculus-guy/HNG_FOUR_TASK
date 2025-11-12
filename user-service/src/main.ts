import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Generate correlation_id per request
  app.use((req, res, next) => {
    req.correlation_id = uuidv4();
    res.setHeader('x-correlation-id', req.correlation_id);
    next();
  });

  // Logging middleware
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

  const port = process.env.PORT || 8;
  await app.listen(port);
  console.log(`[USER_SERVICE] running on port ${port}`);
}
bootstrap();

// git push origin feature/user-service