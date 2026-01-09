import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DocumentSet } from './entities/document-set.entity';
import { CreateDocumentSetDto } from './dto/create-document-set.dto';
import { UpdateDocumentSetDto } from './dto/update-document-set.dto';

@Injectable()
export class DocumentSetsService {
  constructor(
    @InjectRepository(DocumentSet)
    private documentSetsRepository: Repository<DocumentSet>,
  ) {}

  async create(createDocumentSetDto: CreateDocumentSetDto, userId: number): Promise<DocumentSet> {
    const documentSet = this.documentSetsRepository.create({
      title: createDocumentSetDto.title,
      category: createDocumentSetDto.category,
      description: createDocumentSetDto.description,
      sortOrder: createDocumentSetDto.sortOrder ?? 0,
      createdById: userId,
      groups: createDocumentSetDto.groupIds && createDocumentSetDto.groupIds.length > 0
        ? createDocumentSetDto.groupIds.map(id => ({ id } as any))
        : [],
    });

    return this.documentSetsRepository.save(documentSet);
  }

  async findAll(): Promise<DocumentSet[]> {
    return this.documentSetsRepository.find({
      relations: ['groups', 'createdBy'],
      order: { sortOrder: 'ASC', title: 'ASC' },
    });
  }

  async findByUserGroups(groupIds: number[]): Promise<DocumentSet[]> {
    if (!groupIds || groupIds.length === 0) {
      return [];
    }

    return this.documentSetsRepository
      .createQueryBuilder('documentSet')
      .leftJoinAndSelect('documentSet.groups', 'group')
      .where('group.id IN (:...groupIds)', { groupIds })
      .orderBy('documentSet.sortOrder', 'ASC')
      .addOrderBy('documentSet.title', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<DocumentSet> {
    const documentSet = await this.documentSetsRepository.findOne({
      where: { id },
      relations: ['groups', 'documents', 'createdBy', 'updatedBy'],
    });

    if (!documentSet) {
      throw new NotFoundException(`Document set with ID ${id} not found`);
    }

    return documentSet;
  }

  async update(id: number, updateDocumentSetDto: UpdateDocumentSetDto, userId: number): Promise<DocumentSet> {
    const documentSet = await this.findOne(id);

    Object.assign(documentSet, {
      ...updateDocumentSetDto,
      updatedById: userId,
    });

    if (updateDocumentSetDto.groupIds) {
      documentSet.groups = updateDocumentSetDto.groupIds.map(id => ({ id } as any));
    }

    return this.documentSetsRepository.save(documentSet);
  }

  async remove(id: number): Promise<void> {
    const documentSet = await this.findOne(id);
    await this.documentSetsRepository.remove(documentSet);
  }

  async hasAccess(documentSetId: number, userGroupIds: number[]): Promise<boolean> {
    if (!userGroupIds || userGroupIds.length === 0) {
      return false;
    }

    const count = await this.documentSetsRepository
      .createQueryBuilder('documentSet')
      .leftJoin('documentSet.groups', 'group')
      .where('documentSet.id = :documentSetId', { documentSetId })
      .andWhere('group.id IN (:...userGroupIds)', { userGroupIds })
      .getCount();

    return count > 0;
  }
}
