import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Template } from './template.entity';

@Entity('template_versions')
@Index(['template_id', 'version'], { unique: true })
export class TemplateVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id', type: 'uuid' })
  template_id: string;

  @ManyToOne(() => Template, (template: { versions: any; }) => template.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column()
  version: number;

  @Column({ length: 500, nullable: true })
  subject: string;

  @Column('text')
  body: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;
}