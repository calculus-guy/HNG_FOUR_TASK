import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const correlationId = request.headers["x-correlation-id"] || uuidv4();

    request.correlationId = correlationId;

    const now = Date.now();

    this.logger.log(`[${correlationId}] ${method} ${url} - Request received`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `[${correlationId}] ${method} ${url} - Response sent in ${responseTime}ms`
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[${correlationId}] ${method} ${url} - Error after ${responseTime}ms: ${error.message}`
          );
        },
      })
    );
  }
}
