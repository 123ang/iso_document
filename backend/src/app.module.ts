import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { DocumentSetsModule } from './document-sets/document-sets.module';
import { DocumentsModule } from './documents/documents.module';
import { VersionsModule } from './versions/versions.module';
import { AuditModule } from './audit/audit.module';
// Import entities explicitly
import { User } from './users/entities/user.entity';
import { Group } from './groups/entities/group.entity';
import { DocumentSet } from './document-sets/entities/document-set.entity';
import { Document } from './documents/entities/document.entity';
import { DocumentVersion } from './versions/entities/document-version.entity';
import { AuditLog } from './audit/entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Group, DocumentSet, Document, DocumentVersion, AuditLog],
        synchronize: false, // Always use migrations in production
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    GroupsModule,
    DocumentSetsModule,
    DocumentsModule,
    VersionsModule,
    AuditModule,
  ],
})
export class AppModule {}
