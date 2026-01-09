import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class AssignGroupsDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of group IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  groupIds: number[];
}
