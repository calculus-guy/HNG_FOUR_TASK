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

    async getTemplateByName(name: string, language?: string): Promise<Template> {
        const where: any = { name };
        if (language) where.language = language;
        const template = await this.templateRepository.findOne({ where });
        if (!template) {
            const suffix = language ? ` and language '${language}'` : '';
            throw new NotFoundException(`Template with name '${name}'${suffix} not found.`);
        }
        return template;
    }

    async createTemplate(dto: CreateTemplateDto): Promise<Template> {
        const lang = dto.language || 'en';
        const existing = await this.templateRepository.findOne({ where: { name: dto.template_name, language: lang } });
        if (existing) {
            throw new ConflictException(`Template '${dto.template_name}' already exists for language '${lang}'.`);
        }

        const templateData: DeepPartial<Template> = {
            name: dto.template_name,
            subject: dto.subject,
            body: dto.body,
            language: lang,
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

        if (template.subject !== updateData.subject || template.body !== updateData.body) {

            const newVersion = template.version + 1;

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
        return template;
    }

    async findAll(): Promise<Template[]> {
        return this.templateRepository.find();
    }

    // List all versions for a template id
    async getVersionsByTemplateId(id: string): Promise<TemplateVersion[]> {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found.`);
        }
        return this.versionRepository.find({ where: { template_id: id }, order: { version: 'DESC' } });
    }

    // Render subject/body by replacing {{var}} with provided values (string coercion)
    async renderTemplate(params: { template_id?: string; template_name?: string; language?: string; variables?: Record<string, any> }) {
        let tpl: Template | null = null;
        if (params.template_id) {
            tpl = await this.getTemplateById(params.template_id);
        } else if (params.template_name) {
            tpl = await this.getTemplateByName(params.template_name, params.language);
        } else {
            throw new NotFoundException('Provide template_id or template_name');
        }

        const vars = params.variables || {};
        const render = (text?: string) =>
            (text || '').replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_m, key) => {
                const v = key.split('.').reduce((acc: any, k: string) => (acc ? acc[k] : undefined), vars);
                return v !== undefined && v !== null ? String(v) : '';
            });

        return {
            template_id: tpl.id,
            template_name: tpl.name,
            language: tpl.language,
            version: tpl.version,
            subject: render(tpl.subject),
            body: render(tpl.body),
        };
    }
}