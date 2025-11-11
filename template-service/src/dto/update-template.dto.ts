import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO for updating template content (subject or body).

export class UpdateTemplateDto {
    @ApiProperty({ example: 'Updated Welcome Subject', description: 'New email subject line', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    subject?: string;

    @ApiProperty({ example: '<p>Updated content for {{name}}</p>', description: 'New HTML or text body of the template', required: false })
    @IsOptional()
    @IsString()
    body?: string;
}