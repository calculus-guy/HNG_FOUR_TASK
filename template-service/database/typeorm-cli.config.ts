import { DataSource } from 'typeorm';
import { Template } from '../src/entities/template.entity';
import { TemplateVersion } from '../src/entities/template-version.entity';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Load .env from multiple possible locations
const envPaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, './.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log(`Loaded .env from: ${envPath}`);
        envLoaded = true;
        break;
    }
}

if (!envLoaded) {
    console.warn('No .env file found in expected locations.');
}

// Validate required variables
const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
for (const key of requiredVars) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

// TypeORM configuration
const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [Template, TemplateVersion],
    synchronize: false,
    migrations: ['src/database/migrations/*.ts'],
    migrationsTableName: 'typeorm_migrations',
};

//  Export DataSource for CLI
const dataSource = new DataSource({
    ...baseConfig,
    logging: true,
} as any);

export default dataSource;
