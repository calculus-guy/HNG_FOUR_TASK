import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Template } from '../entities/template.entity';
import { TemplateVersion } from '../entities/template-version.entity';
import { CreateTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(Template)
        private readonly templateRepository: Repository<Template>,
        @InjectRepository(TemplateVersion)
        private readonly versionRepository: Repository<TemplateVersion>,
    ) { }

    // Low-latency gRPC method 
    async getTemplateById(id: string): Promise<Template> {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found.`);
        }
        return template;
    }

    async getTemplateByName(name: string): Promise<Template> {
        const template = await this.templateRepository.findOne({ where: { name } });
        if (!template) {
            throw new NotFoundException(`Template with name '${name}' not found.`);
        }
        return template;
    }

    async createTemplate(dto: CreateTemplateDto): Promise<Template> {
        const existing = await this.templateRepository.findOne({ where: { name: dto.template_name } });
        if (existing) {
            throw new ConflictException(`Template name '${dto.template_name}' already exists.`);
        }

        const templateData: DeepPartial<Template> = {
            name: dto.template_name,
            subject: dto.subject,
            body: dto.body,
            language: dto.language,
            version: 1,
        };

        const template = this.templateRepository.create(templateData);
        const savedTemplate = await this.templateRepository.save(template);

        // Create the initial version record 
        await this.versionRepository.save({
            template_id: savedTemplate.id,
            version: 1,
            subject: savedTemplate.subject,
            body: savedTemplate.body,
        });

        return savedTemplate;
    }

    async updateTemplate(id: string, updateData: { subject?: string, body?: string }): Promise<Template> {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found.`);
        }

        // Only update if content actually changed
        if (template.subject !== updateData.subject || template.body !== updateData.body) {

            const newVersion = template.version + 1;

            // Update the main template entity
            template.subject = updateData.subject ?? template.subject;
            template.body = updateData.body ?? template.body;
            template.version = newVersion;

            await this.templateRepository.save(template);

            // Save the new version record
            await this.versionRepository.save({
                template_id: template.id,
                version: newVersion,
                subject: template.subject,
                body: template.body,
            });

            return template;
        }
        return template; // Returns template if no changes
    }

    async findAll(): Promise<Template[]> {
        return this.templateRepository.find();
    }
}