import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request.headers["x-correlation-id"] || request.correlationId || uuidv4()
    );
  }
);
