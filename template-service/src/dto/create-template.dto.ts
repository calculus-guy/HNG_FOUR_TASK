import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
    @ApiProperty({ example: 'welcome_email', description: 'Unique code/name for the template' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    template_name: string;

    @ApiProperty({ example: 'Welcome to our service!', description: 'Email subject line' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    subject: string;

    @ApiProperty({ example: '<h1>Hello {{name}}</h1>', description: 'HTML or text body of the template' })
    @IsNotEmpty()
    @IsString()
    body: string;

    @ApiProperty({ example: 'en', description: 'Language code for the template' })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    language: string = 'en';
}