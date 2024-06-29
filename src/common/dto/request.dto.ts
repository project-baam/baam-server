import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  count: number;

  @ApiProperty()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  page?: number;
}
