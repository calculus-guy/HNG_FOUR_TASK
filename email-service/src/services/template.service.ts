import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';

@Injectable()
export class TemplateService {
  private cache = new Map<string, Handlebars.TemplateDelegate>();

  compileTemplate(templateString: string, templateId: string): Handlebars.TemplateDelegate {
    if (this.cache.has(templateId)) {
      return this.cache.get(templateId)!;
    }

    try {
      const template = Handlebars.compile(templateString);
      this.cache.set(templateId, template);
      
      logger.debug('Template compiled and cached', { templateId });
      return template;
    } catch (error) {
      logger.error('Failed to compile template', { templateId, error });
      throw new Error(`Template compilation failed: ${error}`);
    }
  }

  renderTemplate(template: Handlebars.TemplateDelegate, context: Record<string, any>): string {
    try {
      return template(context);
    } catch (error) {
      logger.error('Failed to render template', { error, context });
      throw new Error(`Template rendering failed: ${error}`);
    }
  }

  loadTemplateFile(templateName: string): string {
    try {
      const templatePath = join(__dirname, '../templates', templateName);
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      logger.error('Failed to load template file', { templateName, error });
      throw new Error(`Template file not found: ${templateName}`);
    }
  }

  clearCache(): void {
    this.cache.clear();
    logger.info('Template cache cleared');
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}