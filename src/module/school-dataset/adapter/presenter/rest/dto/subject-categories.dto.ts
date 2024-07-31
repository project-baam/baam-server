import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { SubjectRequestBase } from './subjects.dto';
import { PaginationDto } from 'src/common/dto/request.dto';

export class SubjectCategoriesRequest extends IntersectionType(
  PaginationDto,
  SubjectRequestBase,
) {}

export class SubjectCategoryResponse {
  @ApiProperty({ description: '교과 분류' })
  category: string;

  @ApiProperty({ description: '과목 수' })
  @Type(() => Number)
  subjectsCount: number;
}
