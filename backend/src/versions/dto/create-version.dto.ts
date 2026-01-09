import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum VersionType {
  MAJOR = 'major',
  MINOR = 'minor',
}

export class CreateVersionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  documentId: number;

  @ApiProperty({ enum: VersionType, example: VersionType.MINOR })
  @IsEnum(VersionType)
  versionType: VersionType;

  @ApiProperty({ example: 'Updated document format and added new section' })
  @IsOptional()
  changeNotes?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
