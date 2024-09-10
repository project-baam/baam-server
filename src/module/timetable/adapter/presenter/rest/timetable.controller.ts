import {
  Body,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { Auth } from 'src/module/iam/adapter/presenter/rest/decorators/auth.decorator';
import { RestApi } from 'src/common/decorator/rest-api.decorator';
import { AuthType } from 'src/module/iam/domain/enums/auth-type.enum';
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
import { ApiExcludeEndpoint, ApiOkResponse } from '@nestjs/swagger';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { SchoolTimeNotSetError } from 'src/common/types/error/application-exceptions';
import { SchoolTimeSettingsUpsertRequest } from './dto/school-time-settings.dto';
import { ApiBooleanResponse } from 'src/docs/decorator/api-boolean-response';

@RestApi('timetable')
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

  @Auth(AuthType.None)
  @Post('default')
  @ApiExcludeEndpoint() // TODO:
  async setUserDefaultTimetable(
    @Query('userId') userId: number,
    @Query('classId') classId: number,
  ): Promise<boolean> {
    await this.timetableService.setUserDefaultTimetableWithFallbackFetch(
      userId,
      classId,
    );

    return true;
  }

  @ApiDescription({
    tags: ['시간표'],
    summary: '유저 시간표 조회',
    description:
      '해당 날짜의 시간표 조회\n\
      - * 1학기: 2월 1일 ~ 7월 31일\n\
      - * 2학기: 8월 1일 ~ 1월 31일\n',
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: Timetable,
    },
    exceptions: [SchoolTimeNotSetError],
  })
  @Get()
  async getUserTimetable(
    @ActiveUser() user: UserEntity,
    @Query() params: UserTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
    await this.timetableService.checkTimeSettings(user.id);
    const [year, semester] = this.dateUtilService.getYearAndSemesterByDate(
      new Date(params.date),
    );
    const timetables = await this.timetableService.findUserTimetable(
      user.id,
      year,
      semester,
    );

    return new ResponseListDto(TimetableMapper.mapToDomain(timetables ?? []));
  }

  @ApiDescription({
    tags: ['시간표'],
    summary: '유저 시간표 내 과목 목록 조회',
    description:
      '해당 날짜 시간표 내 과목 조회\n\
      - * 1학기: 2월 1일 ~ 7월 31일\n\
      - * 2학기: 8월 1일 ~ 1월 31일\n',
    auth: AuthorizationToken.BearerUserToken,
  })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['국어', '수학'],
    },
  })
  @Get('subjects')
  async findUserSubjects(userId: number): Promise<string[]> {
    return this.timetableService.findSubjectsInUserTimetable(userId);
  }

  @ApiDescription({
    tags: ['시간표'],
    summary: '유저 시간표 추가/수정',
    auth: AuthorizationToken.BearerUserToken,
    description:
      '같은 요일 같은 교시에 이미 수업이 있는 경우 > 덮어씌움\n\
    수정된 시간표 반환',
    listResponse: {
      status: HttpStatus.OK,
      schema: Timetable,
    },
    exceptions: [SchoolTimeNotSetError],
  })
  @Put()
  async editOrAddTimetable(
    @ActiveUser() user: UserEntity,
    @Body() params: EditOrAddTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
    await this.timetableService.checkTimeSettings(user.id);

    // TODO: 기존 요일/교시에 이미 있는 수업이, 시간표에 전혀 남아 있지 않을 때, 해당 수업에 대한 메모도 삭제해야함
    await this.timetableService.editOrAddTimetable(user.id, params);
    const updatedTimetables = await this.timetableService.findUserTimetable(
      user.id,
      params.year,
      params.semester,
    );

    return new ResponseListDto(
      TimetableMapper.mapToDomain(updatedTimetables ?? []),
    );
  }

  @ApiDescription({
    tags: ['시간표'],
    summary: '유저 시간표 항목 삭제',
    auth: AuthorizationToken.BearerUserToken,
    description: '수정된 시간표 반환',
    listResponse: {
      status: HttpStatus.OK,
      schema: Timetable,
    },
    exceptions: [SchoolTimeNotSetError],
  })
  @Delete()
  async deleteTimetable(
    @ActiveUser() user: UserEntity,
    @Query() params: DeleteTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
    await this.timetableService.checkTimeSettings(user.id);

    await this.timetableService.deleteTimetable({
      ...params,
      userId: user.id,
    });

    // TODO: 시간표 삭제시, 해당 과목에 대한 메모도 삭제해야함(단, 해당 과목이 유저 시간표에 전혀 남아 있지 않을 때)

    const updatedTimetables = await this.timetableService.findUserTimetable(
      user.id,
      params.year,
      params.semester,
    );

    return new ResponseListDto(
      TimetableMapper.mapToDomain(updatedTimetables ?? []),
    );
  }

  @ApiBooleanResponse(HttpStatus.CREATED)
  @ApiDescription({
    tags: ['시간표'],
    summary: '시간표 시간 설정 or 변경(1교시 시작, 점심시간 시작, 점심시간 끝)',
    auth: AuthorizationToken.BearerUserToken,
  })
  @Post('school-time-settings')
  async upsertSchoolTimeSettings(
    @ActiveUser() user: UserEntity,
    @Body() params: SchoolTimeSettingsUpsertRequest,
  ): Promise<boolean> {
    await this.timetableService.upsertSchoolTimeSettings(user.id, params);

    return true;
  }

  // TODO: 관리자용 API, 스케줄러 최대한 지양
  @Auth(AuthType.None)
  @ApiDescription({
    tags: ['시간표'],
    summary: '연도/학기 업데이트(관리자용)',
  })
  @Post('update-year-semester')
  async updateCurrentYearAndSemester() {
    await this.timetableService.updateCurrentYearAndSemester();
  }
}
