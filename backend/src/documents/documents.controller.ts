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
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { SetCurrentVersionDto } from './dto/set-current-version.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new document (Admin only)' })
  async create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    const document = await this.documentsService.create(createDocumentDto, req.user.id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'CREATE_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: document.id,
      details: { title: document.title, docCode: document.docCode },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return document;
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents (All authenticated users)' })
  findAll() {
    return this.documentsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents by title or code' })
  async search(@Query('q') query: string, @Request() req) {
    const userGroupIds = req.user.groups?.map(g => g.id) || [];
    const results = await this.documentsService.search(query, userGroupIds);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'SEARCH_DOCUMENTS',
      entityType: 'DOCUMENT',
      details: { query, resultsCount: results.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return results;
  }

  @Get('document-set/:setId')
  @ApiOperation({ summary: 'Get documents in a document set' })
  async findByDocumentSet(@Param('setId') setId: string, @Request() req) {
    const userGroupIds = req.user.groups?.map(g => g.id) || [];
    const hasAccess = await this.documentsService.checkUserAccess(+setId, userGroupIds);
    
    if (!hasAccess && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have access to this document set');
    }

    return this.documentsService.findByDocumentSet(+setId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const document = await this.documentsService.findOne(+id);
    const userGroupIds = req.user.groups?.map(g => g.id) || [];
    const hasAccess = await this.documentsService.checkUserAccess(+id, userGroupIds);
    
    if (!hasAccess && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return document;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update document (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    const document = await this.documentsService.update(+id, updateDocumentDto, req.user.id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'UPDATE_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: document.id,
      details: updateDocumentDto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return document;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete document (Admin only)' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.documentsService.remove(+id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'DELETE_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: +id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: 'Document deleted successfully' };
  }

  @Post(':id/set-current-version')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set current version for a document (Admin only)' })
  async setCurrentVersion(
    @Param('id') id: string,
    @Body() setCurrentVersionDto: SetCurrentVersionDto,
    @Request() req,
  ) {
    const document = await this.documentsService.setCurrentVersion(+id, setCurrentVersionDto.versionId);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'SET_CURRENT_VERSION',
      entityType: 'DOCUMENT',
      entityId: document.id,
      details: { versionId: setCurrentVersionDto.versionId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return document;
  }
}
