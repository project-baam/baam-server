import { Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { HttpController } from 'src/module/iam/decorators/http-controller.decorator';
import { ApiDescription } from 'src/common/decorator/api-description.decorator';
import { Auth } from 'src/module/iam/decorators/auth.decorator';
import { AuthType } from 'src/module/iam/enums/auth-type.enum';
import { School } from 'src/module/school-dataset/domain/school';
import { ResponseListDto } from 'src/common/dto/responses-list.dto';
import { GetSchoolsRequest } from './dto/school.dto';
import { ClassResponse } from './dto/class.dto';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { SubjectsRequest } from './dto/subjects.dto';
import {
  SubjectCategoryResponse,
  SubjectCategoriesRequest,
} from './dto/subject-categories.dto';
import { SchoolDatasetService } from './../../../application/school-dataset.service';

@Auth(AuthType.None)
@HttpController('school-dataset')
export class SchoolDatasetController {
  constructor(private readonly schoolDatasetService: SchoolDatasetService) {}

  @ApiDescription({
    tags: ['school-dataset: 학교'],
    summary: '학교 목록 조회',
    description: '페이지네이션, 학교명 검색(선택사항)',
    listResponse: {
      status: HttpStatus.OK,
      schema: School,
    },
  })
  @Get('schools')
  async getSchools(
    @Query() params: GetSchoolsRequest,
  ): Promise<ResponseListDto<School>> {
    const schools = await this.schoolDatasetService.getSchools(params);

    return new ResponseListDto(schools.list, schools.total);
  }

  @ApiExcludeEndpoint()
  @Post('initialize')
  async initializeSchoolDataset() {
    await this.schoolDatasetService.initializeSchoolDataset();

    return true;
  }

  /**
   * 나이스 Open API 로 학년도/학기/학교/학급별 디폴트 시간표 추출
   * 디폴트 시간표 테이블에 INSERT
   */
  @Auth(AuthType.None)
  @ApiExcludeEndpoint()
  @Post('timetable/default')
  async createDefaultTimetable(
    @Query('year') year: number,
    @Query('semester') semester: number,
    @Query('schoolId') schoolId: number,
  ): Promise<boolean> {
    await this.schoolDatasetService.createDefaultTimetable(
      year,
      semester,
      schoolId,
    );

    return true;
  }

  @ApiDescription({
    tags: ['school-dataset: 학급'],
    summary: '학교별 학급 정보 조회',
    description: '페이지네이션 없이 전체 학급 조회',
    listResponse: {
      status: HttpStatus.OK,
      schema: ClassResponse,
    },
    exceptions: [ContentNotFoundError],
  })
  @Get('classes/:schoolId')
  async getClasses(
    @Param('schoolId') schoolId: number,
  ): Promise<ResponseListDto<ClassResponse>> {
    const classes =
      await this.schoolDatasetService.findClassesBySchoolId(schoolId);

    return new ResponseListDto(classes);
  }

  @ApiDescription({
    tags: ['school-dataset: 시간표'],
    summary: '교과 분류 조회',
    description: '시간표 입력시 사용',
    listResponse: {
      status: HttpStatus.OK,
      schema: SubjectCategoryResponse,
    },
  })
  @Get('subject-categories')
  async getSubjectCategories(
    @Query() params: SubjectCategoriesRequest,
  ): Promise<ResponseListDto<SubjectCategoryResponse>> {
    return this.schoolDatasetService.getSubjectCategories(params);
  }

  @ApiDescription({
    tags: ['school-dataset: 시간표'],
    summary: '교과 분류별 과목 목록',
    description: '시간표 입력시 사용',
  })
  @Get('subjects')
  async getSubjects(
    @Query() params: SubjectsRequest,
  ): Promise<ResponseListDto<string>> {
    return this.schoolDatasetService.getSubjects(params);
  }
}
