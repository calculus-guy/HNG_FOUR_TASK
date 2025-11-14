import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class RenderTemplateDto {
  @ApiPropertyOptional({ description: 'Template ID (UUID)', example: 'c3f35135-5a5b-4a1f-8f4f-1a9b5f6f6a9d' })
  @IsOptional()
  @IsString()
  template_id?: string;

  @ApiPropertyOptional({ description: 'Template name/code', example: 'welcome_email' })
  @IsOptional()
  @IsString()
  template_name?: string;

  @ApiPropertyOptional({ description: 'Language code to select variant', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Variables map for substitution', example: { name: 'Jane', app: 'NotifyX' } })
  @IsObject()
  variables!: Record<string, any>;
}

export class RenderTemplateResponse {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    example: {
      template_id: 'uuid',
      template_name: 'welcome_email',
      language: 'en',
      version: 2,
      subject: 'Welcome, Jane',
      body: '<h1>Hello Jane</h1>'
    }
  })
  data!: any;
}
