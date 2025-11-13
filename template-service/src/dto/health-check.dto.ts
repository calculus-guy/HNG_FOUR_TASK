import { ApiProperty } from '@nestjs/swagger';

// Standardized response for the /health endpoint.

export class HealthCheckResponse {
    @ApiProperty({ example: 'ok' })
    status: 'ok' | 'error';

    @ApiProperty({ example: 'template-service' })
    service: string;

    @ApiProperty({ example: 'connected' })
    db_status: 'connected' | 'disconnected' | 'unknown';
    @ApiProperty({ example: 'gRPC service active', required: false })
    grpc_status?: 'active' | 'inactive';

    @ApiProperty({ example: null, required: false })
    error?: string;
}