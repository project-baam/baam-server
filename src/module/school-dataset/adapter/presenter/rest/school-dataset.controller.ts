import { SchoolDatasetService } from './../../../application/school-dataset.service';
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

@Auth(AuthType.None)
@HttpController('school-dataset')
export class SchoolDatasetController {
  constructor(private readonly schoolDatasetService: SchoolDatasetService) {}

  // TODO: pagination
  @ApiDescription({
    tags: ['school-dataset'],
    summary: '학교 목록 조회(학교명 검색, 페이지네이션 O)',
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

  @ApiDescription({
    tags: ['school-dataset'],
    summary: '학교별 학급 정보 조회(페이지네이션 X)',
    listResponse: {
      status: HttpStatus.OK,
      schema: ClassResponse,
    },
  })
  @Get('classes/:schoolId')
  async getClasses(
    @Param('schoolId') schoolId: number,
  ): Promise<ResponseListDto<ClassResponse>> {
    const classes =
      await this.schoolDatasetService.findClassesBySchoolId(schoolId);

    return new ResponseListDto(classes);
  }
}
