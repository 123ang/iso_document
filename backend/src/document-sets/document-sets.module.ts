import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentSetsService } from './document-sets.service';
import { DocumentSetsController } from './document-sets.controller';
import { DocumentSet } from './entities/document-set.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentSet]), AuditModule],
  controllers: [DocumentSetsController],
  providers: [DocumentSetsService],
  exports: [DocumentSetsService],
})
export class DocumentSetsModule {}
