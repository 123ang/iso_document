import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    try {
      const result = await this.authService.login(loginDto);
      
      // Log the login (non-blocking - don't fail login if audit fails)
      try {
        await this.auditService.log({
          userId: result.user.id,
          action: 'LOGIN',
          entityType: 'USER',
          entityId: result.user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      } catch (error) {
        // Log error but don't fail the login
        console.error('Failed to log login to audit:', error);
      }

      return result;
    } catch (error) {
      // Log the actual error for debugging
      console.error('Login error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
