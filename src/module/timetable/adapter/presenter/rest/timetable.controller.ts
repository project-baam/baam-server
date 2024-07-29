import { Body, Delete, Get, HttpStatus, Put, Query } from '@nestjs/common';

import { ApiDescription } from 'src/common/decorator/api-description.decorator';
import { Auth } from 'src/module/iam/decorators/auth.decorator';
import { HttpController } from 'src/module/iam/decorators/http-controller.decorator';
import { AuthType } from 'src/module/iam/enums/auth-type.enum';
import { TimetableMapper } from 'src/module/timetable/application/mappers/timetable.mapper';
import { TimetableService } from 'src/module/timetable/application/timetable.service';
import { Timetable } from 'src/module/timetable/domain/timetable';
import {
  DefaultTimetableRequest,
  DeleteTimetableRequest,
  EditOrAddTimetableRequest,
  UserTimetableRequest,
} from './dto/timetable.dto';
import { DateUtilService } from 'src/module/util/date-util.service';
import { ResponseListDto } from 'src/common/dto/responses-list.dto';

@HttpController('timetable')
export class TimetableController {
  constructor(
    private readonly timetableService: TimetableService,
    private readonly dateUtilService: DateUtilService,
  ) {}

  @Auth(AuthType.None)
  @ApiDescription({
    tags: ['school-dataset: 시간표'],
    summary: '학급별 기본 시간표 조회',
    listResponse: {
      status: HttpStatus.OK,
      schema: Timetable,
    },
  })
  @Get('default')
  async getDefaultTimetable(
    @Query() params: DefaultTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
    const timetables =
      await this.timetableService.findDefaultClassTimetable(params);

    return new ResponseListDto(TimetableMapper.mapToDomain(timetables ?? []));
  }

  @Auth(AuthType.None) // TODO: 유저 인증 작업 머지 후 수정 필요
  @ApiDescription({
    tags: ['시간표'],
    summary: '유저 시간표 조회',
    listResponse: {
      status: HttpStatus.OK,
      schema: Timetable,
    },
  })
  @Get()
  async getUserTimetable(
    @Query() params: UserTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
    const [year, semester] = this.dateUtilService.getYearAndSemesterByDate(
      new Date(params.date),
    );
    const timetables = await this.timetableService.findUserTimetable(
      params.userId,
      year,
      semester,
    );

    return new ResponseListDto(TimetableMapper.mapToDomain(timetables ?? []));
  }

  @Auth(AuthType.None) // TODO: 유저 인증 작업 머지 후 수정 필요
  @ApiDescription({
    tags: ['시간표'],
    summary: '유저 시간표 추가/수정',
    description:
      '같은 요일 같은 교시에 이미 수업이 있는 경우 > 덮어씌움\n\
    수정된 시간표 반환',
    listResponse: {
      status: HttpStatus.OK,
      schema: Timetable,
    },
  })
  @Put()
  async editOrAddTimetable(
    @Body() params: EditOrAddTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
    await this.timetableService.editOrAddTimetable(params);
    const updatedTimetables = await this.timetableService.findUserTimetable(
      params.userId,
      params.year,
      params.semester,
    );

    return new ResponseListDto(
      TimetableMapper.mapToDomain(updatedTimetables ?? []),
    );
  }

  @Auth(AuthType.None) // TODO: 유저 인증 작업 머지 후 수정 필요
  @ApiDescription({
    tags: ['시간표'],
    summary: '유저 시간표 항목 삭제',
    description: '수정된 시간표 반환',
    listResponse: {
      status: HttpStatus.OK,
      schema: Timetable,
    },
  })
  @Delete()
  async deleteTimetable(
    @Query() params: DeleteTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
    await this.timetableService.deleteTimetable(params);

    const updatedTimetables = await this.timetableService.findUserTimetable(
      params.userId,
      params.year,
      params.semester,
    );

    return new ResponseListDto(
      TimetableMapper.mapToDomain(updatedTimetables ?? []),
    );
  }
}
