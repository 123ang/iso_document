import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { VersionsService } from './versions.service';
import { VersionsController } from './versions.controller';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentsModule } from '../documents/documents.module';
import { AuditModule } from '../audit/audit.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentVersion]),
    DocumentsModule,
    AuditModule,
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const storagePath = process.env.STORAGE_PATH || '../storage';
          cb(null, storagePath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 1073741824, // 1GB default
      },
    }),
  ],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
