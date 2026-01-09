import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DocumentSet } from '../../document-sets/entities/document-set.entity';
import { DocumentVersion } from '../../versions/entities/document-version.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => DocumentSet, (documentSet) => documentSet.documents)
  @JoinColumn({ name: 'document_set_id' })
  documentSet: DocumentSet;

  @Column({ name: 'document_set_id', type: 'bigint' })
  documentSetId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ name: 'doc_code', length: 50, nullable: true })
  docCode: string;

  @OneToOne(() => DocumentVersion)
  @JoinColumn({ name: 'current_version_id' })
  currentVersion: DocumentVersion;

  @Column({ name: 'current_version_id', type: 'bigint', nullable: true })
  currentVersionId: number;

  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions: DocumentVersion[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', type: 'bigint' })
  createdById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedById: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
