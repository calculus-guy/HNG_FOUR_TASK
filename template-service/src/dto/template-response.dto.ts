import { ApiProperty } from '@nestjs/swagger';
import { Template } from '../entities/template.entity';
import { PaginationMeta } from './pagination-meta.dto';
import { ApiResponse } from '../../shared/interfaces/common.interface';

export class TemplateData {
    @ApiProperty({ example: 'f321b19a-5e34-4a4b-8d0f-48e025f190f8' })
    id: string;

    @ApiProperty({ example: 'welcome_email' })
    template_name: string;

    @ApiProperty({ example: 'Welcome!' })
    subject: string;

    @ApiProperty({ example: '<h1>Hi {{name}}</h1>' })
    body: string;

    @ApiProperty({ example: 1 })
    current_version: number;

    @ApiProperty({ example: 'en' })
    language: string;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;
}

//  Adds DTO to the shared ApiResponse contract
export class TemplateResponse implements ApiResponse<TemplateData> {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ type: TemplateData, isArray: false, required: false })
    data?: TemplateData;

    @ApiProperty({ example: 'Template retrieved successfully.' })
    message: string;

    @ApiProperty({ type: 'object', required: false })
    error?: string;

    // Pagination is used for the LIST endpoint
    @ApiProperty({ type: PaginationMeta, required: false })
    meta?: PaginationMeta;
}

// Mapping function to convert entity to DTO/snake_case
export const toTemplateData = (template: Template): TemplateData => ({
    id: template.id,
    template_name: template.name,
    subject: template.subject,
    body: template.body,
    current_version: template.version,
    language: template.language,
    created_at: template.created_at,
    updated_at: template.updated_at,
});