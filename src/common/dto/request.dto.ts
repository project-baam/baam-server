import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty()
  @IsPositive()
  @Type(() => Number)
  count: number;

  @ApiProperty()
  @Min(0)
  @IsNumber()
  @Type(() => Number)
  page: number;
}
