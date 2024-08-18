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
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { AuthorizationToken } from 'src/docs/constant/authorization-token';

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
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: Timetable,
    },
  })
  @Get()
  async getUserTimetable(
    @ActiveUser() user: UserEntity,
    @Query() params: UserTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
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
    summary: '유저 시간표 추가/수정',
    auth: AuthorizationToken.BearerUserToken,
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
    @ActiveUser() user: UserEntity,
    @Body() params: EditOrAddTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
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
  })
  @Delete()
  async deleteTimetable(
    @ActiveUser() user: UserEntity,
    @Query() params: DeleteTimetableRequest,
  ): Promise<ResponseListDto<Timetable>> {
    await this.timetableService.deleteTimetable({
      ...params,
      userId: user.id,
    });

    const updatedTimetables = await this.timetableService.findUserTimetable(
      user.id,
      params.year,
      params.semester,
    );

    return new ResponseListDto(
      TimetableMapper.mapToDomain(updatedTimetables ?? []),
    );
  }
}
