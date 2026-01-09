import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Management' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Senior management and executives' })
  @IsOptional()
  description?: string;
}
