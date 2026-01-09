import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentSetsService } from './document-sets.service';
import { CreateDocumentSetDto } from './dto/create-document-set.dto';
import { UpdateDocumentSetDto } from './dto/update-document-set.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';

@ApiTags('Document Sets')
@Controller('document-sets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentSetsController {
  constructor(
    private readonly documentSetsService: DocumentSetsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new document set (Admin only)' })
  async create(@Body() createDocumentSetDto: CreateDocumentSetDto, @Request() req) {
    const documentSet = await this.documentSetsService.create(createDocumentSetDto, req.user.id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'CREATE_DOCUMENT_SET',
      entityType: 'DOCUMENT_SET',
      entityId: documentSet.id,
      details: { title: documentSet.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return documentSet;
  }

  @Get()
  @ApiOperation({ summary: 'Get all document sets (All authenticated users)' })
  findAll() {
    return this.documentSetsService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get document sets accessible by current user' })
  async getMyDocumentSets(@Request() req) {
    const user = req.user;
    
    // Admin users see all document sets
    if (user.role === 'admin') {
      return this.documentSetsService.findAll();
    }
    
    // Regular users see only document sets assigned to their groups
    const groupIds = user.groups?.map(g => g.id) || [];
    return this.documentSetsService.findByUserGroups(groupIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document set by ID' })
  findOne(@Param('id') id: string) {
    return this.documentSetsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update document set (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentSetDto: UpdateDocumentSetDto,
    @Request() req,
  ) {
    const documentSet = await this.documentSetsService.update(+id, updateDocumentSetDto, req.user.id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'UPDATE_DOCUMENT_SET',
      entityType: 'DOCUMENT_SET',
      entityId: documentSet.id,
      details: updateDocumentSetDto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return documentSet;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete document set (Admin only)' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.documentSetsService.remove(+id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'DELETE_DOCUMENT_SET',
      entityType: 'DOCUMENT_SET',
      entityId: +id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: 'Document set deleted successfully' };
  }
}
