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
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignGroupsDto } from './dto/assign-groups.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { AuditService } from '../audit/audit.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const user = await this.usersService.create(createUserDto);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'CREATE_USER',
      entityType: 'USER',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return user;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.usersService.update(+id, updateUserDto);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'UPDATE_USER',
      entityType: 'USER',
      entityId: user.id,
      details: updateUserDto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return user;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.usersService.remove(+id);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'DELETE_USER',
      entityType: 'USER',
      entityId: +id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: 'User deleted successfully' };
  }

  @Post(':id/groups')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign user to groups (Admin only)' })
  async assignGroups(
    @Param('id') id: string,
    @Body() assignGroupsDto: AssignGroupsDto,
    @Request() req,
  ) {
    const user = await this.usersService.assignToGroups(+id, assignGroupsDto.groupIds);
    
    await this.auditService.log({
      userId: req.user.id,
      action: 'ASSIGN_USER_GROUPS',
      entityType: 'USER',
      entityId: user.id,
      details: { groupIds: assignGroupsDto.groupIds },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return user;
  }
}
