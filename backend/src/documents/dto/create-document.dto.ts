import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  documentSetId: number;

  @ApiProperty({ example: 'Quality Manual' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'QM-001' })
  @IsOptional()
  docCode?: string;
}
