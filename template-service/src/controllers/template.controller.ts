import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplateService } from '../services/template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { TemplateResponse, toTemplateData } from '../dto/template-response.dto';
import { HealthCheckResponse } from '../dto/health-check.dto';
import { RenderTemplateDto, RenderTemplateResponse } from '../dto/render-template.dto';

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
    constructor(private readonly templateService: TemplateService) { }

    @Get('health')
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, type: HealthCheckResponse })
    async health(): Promise<HealthCheckResponse> {
        // Basic health check: Try to connect to DB
        try {
            await this.templateService.findAll();
            return { status: 'ok', service: 'template-service', db_status: 'connected', grpc_status: 'active' };
        } catch (error) {
            return { status: 'error', service: 'template-service', db_status: 'disconnected', error: error.message, grpc_status: 'active' };
        }
    }

    @Post()
    @ApiOperation({ summary: 'Create a new template' })
    @ApiResponse({ status: 201, type: TemplateResponse })
    async create(@Body() createTemplateDto: CreateTemplateDto): Promise<TemplateResponse> {
        const template = await this.templateService.createTemplate(createTemplateDto);
        return {
            success: true,
            message: 'Template created successfully.',
            data: toTemplateData(template),
        };
    }

    @Get('by-name/:name')
    @ApiOperation({ summary: 'Get template by name' })
    @ApiResponse({ status: 200, type: TemplateResponse })
    async findByName(@Param('name') name: string, @Query('lang') lang?: string): Promise<TemplateResponse> {
        const template = await this.templateService.getTemplateByName(name, lang);
        return {
            success: true,
            message: 'Template retrieved successfully.',
            data: toTemplateData(template),
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get template by ID' })
    @ApiResponse({ status: 200, type: TemplateResponse })
    async findOne(@Param('id') id: string): Promise<TemplateResponse> {
        const template = await this.templateService.getTemplateById(id);
        return {
            success: true,
            message: 'Template retrieved successfully.',
            data: toTemplateData(template),
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update template subject/body and create new version' })
    @ApiResponse({ status: 200, type: TemplateResponse })
    async update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto): Promise<TemplateResponse> {
        const template = await this.templateService.updateTemplate(id, updateTemplateDto);
        return {
            success: true,
            message: 'Template updated and new version saved successfully.',
            data: toTemplateData(template),
        };
    }

    @Get(':id/versions')
    @ApiOperation({ summary: 'List all versions for a template' })
    @ApiResponse({ status: 200, description: 'Array of version records' })
    async versions(@Param('id') id: string) {
        const versions = await this.templateService.getVersionsByTemplateId(id);
        return { success: true, data: versions };
    }

    @Post('render')
    @ApiOperation({ summary: 'Render a template with variables' })
    @ApiResponse({ status: 200, type: RenderTemplateResponse })
    async render(@Body() dto: RenderTemplateDto): Promise<RenderTemplateResponse> {
        const rendered = await this.templateService.renderTemplate({
            template_id: dto.template_id,
            template_name: dto.template_name,
            language: dto.language,
            variables: dto.variables,
        });
        return { success: true, data: rendered };
    }
}