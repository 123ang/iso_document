import { PartialType } from '@nestjs/swagger';
import { CreateDocumentSetDto } from './create-document-set.dto';

export class UpdateDocumentSetDto extends PartialType(CreateDocumentSetDto) {}
