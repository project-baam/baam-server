import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { Grade } from 'src/module/school-dataset/domain/value-objects/grade';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/request.dto';
import {
  supportedYears,
  SupportedYears,
} from 'src/module/school-dataset/domain/value-objects/supported-years';

export class SubjectRequestBase {
  @ApiProperty({ type: 'enum', enum: Grade, description: '학년' })
  @IsEnum(Grade)
  @Type(() => Number)
  grade: Grade;

  @ApiProperty({
    description: '학년도',
    enum: supportedYears,
  })
  @IsIn(supportedYears)
  @Type(() => Number)
  year: SupportedYears;
}

export class SubjectsRequest extends IntersectionType(
  SubjectRequestBase,
  PaginationDto,
) {
  @ApiProperty({
    description: '교과 분류, 없을 경우 전체 목록 조회',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: '검색어(과목명 기준), 없을 경우 전체 목록 조회',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class SubjectsResponse {
  @ApiProperty({ type: 'string', isArray: true })
  subjects: string[];
}

export class SubjectsGroupByCategory {
  @ApiProperty()
  category: string;

  @ApiProperty({ type: 'string', isArray: true })
  subjects: string[];
}
