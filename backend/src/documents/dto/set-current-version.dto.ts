import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetCurrentVersionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  versionId: number;
}
