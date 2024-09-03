import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class InsertTestUserDto {
  @ApiProperty({
    description: '학교 ID',
    example: 1,
  })
  @IsNumber()
  schoolId: number;
}
