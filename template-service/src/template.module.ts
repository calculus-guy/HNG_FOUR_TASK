import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateController } from './controllers/template.controller';
import { TemplateService } from './services/template.service';
import { Template } from './entities/template.entity';
import { TemplateVersion } from './entities/template-version.entity';
import { TemplateGrpcController } from './grpc/template-grpc.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: config.get<string>('DATABASE_URL_TEMPLATE'),
                entities: [Template, TemplateVersion],
                synchronize: false,
                autoLoadEntities: true,
            }),
        }),
        TypeOrmModule.forFeature([Template, TemplateVersion]),
    ],
    controllers: [TemplateController, TemplateGrpcController],
    providers: [TemplateService],
})
export class TemplateModule { }