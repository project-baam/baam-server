import {
  Body,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RestApi } from 'src/common/decorator/rest-api.decorator';
import {
  CreateEventRequest,
  GetMonthEventsRequest,
  UpdateEventBodyParams,
} from './dto/calendar.dto';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { CalendarService } from 'src/module/calendar/application/calendar.service';
import { ResponseListDto } from 'src/common/dto/responses-list.dto';
import { EventMapper } from 'src/module/calendar/application/mappers/event.mapper';
import { Event } from 'src/module/calendar/domain/event';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { ApiBooleanResponse } from 'src/docs/decorator/api-boolean-response';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';

@RestApi('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @ApiDescription({
    tags: ['Calendar'],
    summary: '월별 이벤트 조회',
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: Event,
    },
  })
  @Get(':year/:month')
  //   @UseInterceptors(CacheInterceptor) // TODO: 캐시 적용
  async getMonthEvents(
    @ActiveUser() user: UserEntity,
    @Param() pathParams: GetMonthEventsRequest,
  ): Promise<ResponseListDto<Event>> {
    const events = await this.calendarService.getMonthEvents(
      user.id,
      user.profile.class.grade,
      user.profile.class.schoolId,
      pathParams.year,
      pathParams.month,
    );

    return new ResponseListDto(EventMapper.mapToDomain(events ?? []));
  }

  @ApiBooleanResponse(HttpStatus.CREATED)
  @ApiDescription({
    tags: ['Calendar'],
    summary: '일정 생성',
    auth: AuthorizationToken.BearerUserToken,
  })
  @Post('event')
  async createEvent(
    @ActiveUser() user: UserEntity,
    @Body() params: CreateEventRequest,
  ): Promise<boolean> {
    await this.calendarService.createEvent(user.id, params);

    return true;
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['Calendar'],
    summary: '일정 변경',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Patch(':id')
  async updateEvent(
    @ActiveUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() params: UpdateEventBodyParams,
  ): Promise<boolean> {
    await this.calendarService.updateEvent(user.id, { ...params, id: +id });

    return true;
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['Calendar'],
    summary: '일정 삭제',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Delete(':id')
  async deleteEvent(
    @ActiveUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: string,
  ): Promise<boolean> {
    await this.calendarService.deleteEvent(user.id, +id);

    return true;
  }
}
