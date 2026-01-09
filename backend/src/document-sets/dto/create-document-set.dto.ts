import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateDocumentSetDto {
  @ApiProperty({ example: 'ISO 9001:2015' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Quality Management' })
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'ISO 9001:2015 Quality Management System documentation' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: [1, 2, 3], description: 'Array of group IDs that can access this document set' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  groupIds?: number[];
}
