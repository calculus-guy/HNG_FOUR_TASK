import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import * as morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

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
  app.useGlobalGuards(new JwtAuthGuard(), new RolesGuard(reflector));

  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`[USER_SERVICE] running on port ${port}`);
}

bootstrap();