import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { DocumentsService } from '../documents/documents.service';

@ApiTags('Document Versions')
@Controller('versions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VersionsController {
  constructor(
    private readonly versionsService: VersionsService,
    private readonly documentsService: DocumentsService,
    private readonly auditService: AuditService,
  ) {}

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new document version (Admin only)' })
  async uploadVersion(
    @UploadedFile() file: Express.Multer.File,
    @Body() createVersionDto: CreateVersionDto,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const version = await this.versionsService.create(createVersionDto, file, req.user.id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'UPLOAD_VERSION',
      entityType: 'VERSION',
      entityId: version.id,
      details: {
        documentId: version.documentId,
        versionLabel: version.versionLabel,
        filename: version.originalFilename,
        size: version.sizeBytes,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return version;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all versions (Admin only)' })
  findAll() {
    return this.versionsService.findAll();
  }

  @Get('document/:documentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all versions of a document (Admin only)' })
  findByDocument(@Param('documentId') documentId: string) {
    return this.versionsService.findByDocument(+documentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get version by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const version = await this.versionsService.findOne(+id);
    const userGroupIds = req.user.groups?.map(g => g.id) || [];
    const hasAccess = await this.documentsService.checkUserAccess(version.documentId, userGroupIds);
    
    if (!hasAccess && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have access to this document version');
    }

    return version;
  }

  @Post(':id/set-current')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set version as current (Admin only)' })
  async setAsCurrent(@Param('id') id: string, @Request() req) {
    const version = await this.versionsService.setAsCurrent(+id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'SET_CURRENT_VERSION',
      entityType: 'VERSION',
      entityId: version.id,
      details: {
        documentId: version.documentId,
        versionLabel: version.versionLabel,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return version;
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document version' })
  async download(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const version = await this.versionsService.findOne(+id);
    const userGroupIds = req.user.groups?.map(g => g.id) || [];
    const hasAccess = await this.documentsService.checkUserAccess(version.documentId, userGroupIds);
    
    if (!hasAccess && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have access to this document');
    }

    const { stream, filename, mimeType } = await this.versionsService.getFileStream(+id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'DOWNLOAD_VERSION',
      entityType: 'VERSION',
      entityId: +id,
      details: {
        documentId: version.documentId,
        filename,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    stream.pipe(res);
  }

  @Get(':id/view')
  @ApiOperation({ summary: 'View/preview document version in browser' })
  async view(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const version = await this.versionsService.findOne(+id);
    const userGroupIds = req.user.groups?.map(g => g.id) || [];
    const hasAccess = await this.documentsService.checkUserAccess(version.documentId, userGroupIds);
    
    if (!hasAccess && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have access to this document');
    }

    const { stream, filename, mimeType } = await this.versionsService.getFileStream(+id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'VIEW_VERSION',
      entityType: 'VERSION',
      entityId: +id,
      details: {
        documentId: version.documentId,
        filename,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${filename}"`,
    });

    stream.pipe(res);
  }
}
