import { DataSource } from 'typeorm';
import { Template } from '../src/entities/template.entity';
import { TemplateVersion } from '../src/entities/template-version.entity';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Load environment variables
dotenv.config({ path: '../../.env' });

const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL_TEMPLATE,
    entities: [Template, TemplateVersion],
    synchronize: false,
    migrations: ['src/database/migrations/*.ts'],
    migrationsTableName: 'typeorm_migrations',
};

// Configuration for TypeORM CLI
const dataSource = new DataSource({
    ...baseConfig,
    logging: true,
} as any);

export default dataSource;

// Example Migration Command Structure (You would generate this):
// npm run typeorm migration:create ./src/database/migrations/TemplateInitialSchema