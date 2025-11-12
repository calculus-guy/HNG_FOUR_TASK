import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const header = process.env.CORRELATION_ID_HEADER || 'x-correlation-id';
    const incoming = req.headers[header] || req.headers['x-request-id'];
    const id = incoming || uuidv4();
    req.headers[header] = id;
    res.setHeader(header, id);
    return next.handle();
  }
}