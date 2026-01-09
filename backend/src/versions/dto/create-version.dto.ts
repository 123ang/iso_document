import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVersionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  documentId: number;

  @ApiProperty({ example: 'Updated document format and added new section' })
  @IsOptional()
  changeNotes?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
