import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('document_versions')
export class DocumentVersion {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => Document, (document) => document.versions)
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id', type: 'bigint' })
  documentId: number;

  @Column({ name: 'version_major', default: 1 })
  versionMajor: number;

  @Column({ name: 'version_minor', default: 0 })
  versionMinor: number;

  @Column({ name: 'version_label', length: 10 })
  versionLabel: string;

  // Computed property for version number (e.g., 1.0, 2.0, 3.0)
  get versionNumber(): number {
    return parseFloat(`${this.versionMajor}.${this.versionMinor}`);
  }

  @Column({ name: 'change_notes', type: 'text', nullable: true })
  changeNotes: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'original_filename', length: 255 })
  originalFilename: string;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ name: 'checksum_sha256', length: 64, nullable: true })
  checksumSha256: string;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', type: 'bigint' })
  createdById: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
