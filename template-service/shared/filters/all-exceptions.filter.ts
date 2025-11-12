import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiResponse } from "../interfaces/common.interface";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal server error";
        let error_code = "INTERNAL_SERVER_ERROR";

        // Handle NestJS HTTP Exceptions
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
                // Validation errors return an array of messages
                message = (exceptionResponse as any).message || exception.message;
                error_code = (exceptionResponse as any).error || exception.name;
            } else {
                message = exceptionResponse.toString();
                error_code = exception.name;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            error_code = exception.name || "UNHANDLED_ERROR";
        }

        this.logger.error(
            `HTTP Status: ${status} - Error Code: ${error_code} - Path: ${request.url}`,
            (exception as Error).stack
        );

        // Ensure response is in the required snake_case format
        const responseBody: ApiResponse<null> = {
            success: false,
            message: message,
            error: error_code,
            data: null,
        };

        response.status(status).json(responseBody);
    }
}