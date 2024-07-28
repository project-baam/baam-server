import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { Grade } from 'src/module/school-dataset/domain/value-objects/grade';
import { Transform, Type } from 'class-transformer';
import { CurriculumVersion } from 'src/module/school-dataset/domain/value-objects/curriculum-version';
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

  static getCurriculumVersion(
    year: SupportedYears,
    grade: Grade,
  ): CurriculumVersion {
    switch (year) {
      case 2024:
        return CurriculumVersion.V2015;

      case 2025:
        return grade === Grade.First
          ? CurriculumVersion.V2022
          : CurriculumVersion.V2015;

      case 2026:
        return grade === Grade.Third
          ? CurriculumVersion.V2015
          : CurriculumVersion.V2022;

      case 2027:
        return CurriculumVersion.V2022;
    }
  }
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
