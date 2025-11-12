import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm';
import { TemplateVersion } from './template-version.entity';

@Entity('templates')
@Index(['name'], { unique: true })
export class Template {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, unique: true })
    name: string;

    @Column({ length: 500, nullable: true })
    subject: string;

    @Column('text')
    body: string;

    @Column({ default: 1 })
    version: number;

    @Column({ length: 10, default: 'en' })
    language: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'NOW()' })
    created_at: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
    updated_at: Date;

    @OneToMany(() => TemplateVersion, (version: { template: any; }) => version.template)
    versions: TemplateVersion[];
}