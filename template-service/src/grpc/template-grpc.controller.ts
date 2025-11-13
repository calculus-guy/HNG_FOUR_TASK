
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TemplateService } from '../services/template.service';

interface TemplateRequest {
    template_id?: string;
    template_code?: string;
}

interface TemplateGrpcResponse {
    template_id: string;
    template_code: string;
    subject: string;
    body: string;
    current_version: number;
    language: string;
}

@Controller()
export class TemplateGrpcController {
    constructor(private readonly templateService: TemplateService) { }

    @GrpcMethod('TemplateService', 'GetTemplate')
    async GetTemplate(data: TemplateRequest): Promise<TemplateGrpcResponse> {
        let template;

        if (data.template_id) {
            template = await this.templateService.getTemplateById(data.template_id);
        } else if (data.template_code) {
            template = await this.templateService.getTemplateByName(data.template_code);
        } else {

            throw new Error('Must provide template_id or template_code.');
        }

        return {
            template_id: template.id,
            template_code: template.name,
            subject: template.subject,
            body: template.body,
            current_version: template.version,
            language: template.language,
        };
    }
}