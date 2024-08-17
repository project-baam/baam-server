import { Dayjs } from 'dayjs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, Length } from 'class-validator';

export class MealRequest {
  @ApiProperty({ description: '학교 ID' })
  @IsNumber()
  @Type(() => Number)
  schoolId: number;

  @ApiProperty({ description: 'yyyy-mm-dd' })
  @IsDateString()
  @Length(10, 10)
  date: Dayjs;
}
