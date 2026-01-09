import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentVersion } from './entities/document-version.entity';
import { CreateVersionDto } from './dto/create-version.dto';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class VersionsService {
  constructor(
    @InjectRepository(DocumentVersion)
    private versionsRepository: Repository<DocumentVersion>,
    private configService: ConfigService,
    @Inject(forwardRef(() => DocumentsService))
    private documentsService: DocumentsService,
  ) {}

  async create(
    createVersionDto: CreateVersionDto,
    file: Express.Multer.File,
    userId: number,
  ): Promise<DocumentVersion> {
    // Calculate checksum
    const checksum = await this.calculateFileChecksum(file.path);

    // Determine version number - simple auto-increment: 1.0, 2.0, 3.0, etc.
    const latestVersion = await this.versionsRepository.findOne({
      where: { documentId: createVersionDto.documentId },
      order: { versionMajor: 'DESC', versionMinor: 'DESC' },
    });

    let versionMajor = 1;
    let versionMinor = 0;

    if (latestVersion) {
      // Auto-increment: if latest is 1.0, next is 2.0; if 2.0, next is 3.0, etc.
      versionMajor = latestVersion.versionMajor + 1;
      versionMinor = 0;
    }

    const versionLabel = `${versionMajor}.${versionMinor}`;

    // If this is the first version, mark it as current
    const isFirstVersion = !latestVersion;

    const version = this.versionsRepository.create({
      documentId: createVersionDto.documentId,
      versionMajor,
      versionMinor,
      versionLabel,
      changeNotes: createVersionDto.changeNotes,
      filePath: file.path,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksumSha256: checksum,
      isCurrent: isFirstVersion,
      createdById: userId,
    });

    const savedVersion = await this.versionsRepository.save(version);

    // Always set the new version as current and unset others
    // This also updates the document's currentVersionId
    await this.setAsCurrent(savedVersion.id);

    return savedVersion;
  }

  async findAll(): Promise<DocumentVersion[]> {
    return this.versionsRepository.find({
      relations: ['document', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDocument(documentId: number): Promise<DocumentVersion[]> {
    return this.versionsRepository.find({
      where: { documentId },
      relations: ['createdBy'],
      order: { versionMajor: 'DESC', versionMinor: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DocumentVersion> {
    const version = await this.versionsRepository.findOne({
      where: { id },
      relations: ['document', 'createdBy'],
    });

    if (!version) {
      throw new NotFoundException(`Version with ID ${id} not found`);
    }

    return version;
  }

  async setAsCurrent(versionId: number): Promise<DocumentVersion> {
    const version = await this.findOne(versionId);

    // Unmark all other versions of this document
    await this.versionsRepository.update(
      { documentId: version.documentId },
      { isCurrent: false },
    );

    // Mark this version as current
    version.isCurrent = true;
    const savedVersion = await this.versionsRepository.save(version);

    // Update document's currentVersionId
    await this.documentsService.setCurrentVersion(version.documentId, savedVersion.id);

    return savedVersion;
  }

  async getFileStream(versionId: number) {
    const version = await this.findOne(versionId);

    if (!existsSync(version.filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    const stream = createReadStream(version.filePath);
    return {
      stream,
      filename: version.originalFilename,
      mimeType: version.mimeType,
      size: version.sizeBytes,
    };
  }

  private async calculateFileChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
}
