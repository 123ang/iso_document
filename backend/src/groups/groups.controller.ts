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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group (Admin only)' })
  async create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    const group = await this.groupsService.create(createGroupDto);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'CREATE_GROUP',
      entityType: 'GROUP',
      entityId: group.id,
      details: { name: group.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return group;
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups (Admin only)' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req,
  ) {
    const group = await this.groupsService.update(+id, updateGroupDto);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'UPDATE_GROUP',
      entityType: 'GROUP',
      entityId: group.id,
      details: updateGroupDto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return group;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete group (Admin only)' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.groupsService.remove(+id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'DELETE_GROUP',
      entityType: 'GROUP',
      entityId: +id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: 'Group deleted successfully' };
  }
}
