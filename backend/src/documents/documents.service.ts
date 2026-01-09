import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentSetsService } from '../document-sets/document-sets.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private documentSetsService: DocumentSetsService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, userId: number): Promise<Document> {
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      createdById: userId,
    });

    return this.documentsRepository.save(document);
  }

  async findAll(): Promise<Document[]> {
    return this.documentsRepository.find({
      relations: ['documentSet', 'currentVersion', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDocumentSet(documentSetId: number): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { documentSetId },
      relations: ['currentVersion', 'createdBy', 'updatedBy'],
      order: { title: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['documentSet', 'currentVersion', 'versions', 'createdBy', 'updatedBy'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto, userId: number): Promise<Document> {
    const document = await this.findOne(id);

    Object.assign(document, {
      ...updateDocumentDto,
      updatedById: userId,
    });

    return this.documentsRepository.save(document);
  }

  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);
    await this.documentsRepository.remove(document);
  }

  async setCurrentVersion(documentId: number, versionId: number): Promise<Document> {
    const document = await this.findOne(documentId);
    document.currentVersionId = versionId;
    return this.documentsRepository.save(document);
  }

  async search(query: string, userGroupIds: number[]): Promise<Document[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query}%`;

    // Get accessible document set IDs for the user
    const accessibleSets = await this.documentSetsService.findByUserGroups(userGroupIds);
    const documentSetIds = accessibleSets.map(set => set.id);

    if (documentSetIds.length === 0) {
      return [];
    }

    return this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.currentVersion', 'currentVersion')
      .leftJoinAndSelect('document.documentSet', 'documentSet')
      .where('document.documentSetId IN (:...documentSetIds)', { documentSetIds })
      .andWhere('(document.title LIKE :searchTerm OR document.docCode LIKE :searchTerm)', { searchTerm })
      .orderBy('document.title', 'ASC')
      .take(50)
      .getMany();
  }

  async checkUserAccess(documentId: number, userGroupIds: number[]): Promise<boolean> {
    const document = await this.findOne(documentId);
    return this.documentSetsService.hasAccess(document.documentSetId, userGroupIds);
  }
}
