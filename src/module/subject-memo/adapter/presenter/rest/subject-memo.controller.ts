import {
  Body,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RestApi } from 'src/common/decorator/rest-api.decorator';
import { ResponseListDto } from 'src/common/dto/responses-list.dto';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { SubjectMemoService } from 'src/module/subject-memo/application/subject-memo.service';
import { SubjectMemo } from 'src/module/subject-memo/domain/subject-memo';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import {
  CreateSubjectMemoRequest,
  GetSubjectMemoRequest,
  UpdateSubjectMemoRequest,
} from './dto/subject-memo.dto';
import { ApiBooleanResponse } from 'src/docs/decorator/api-boolean-response';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { SubjectMemoDetail } from 'src/module/subject-memo/domain/subjet-memo-detail';

/**
 * 과목별 메모 목록 조회(메모가 없어도 과목 목록은 보내야함. 없으면 빈 배열)
 * 메모 생성(과목, 날짜, 제목, 메모 내용)
 * + 수정 삭제도 있겟지 머
 */

@RestApi('subject-memo')
export class SubjectMemoController {
  constructor(private readonly subjectMemoService: SubjectMemoService) {}

  @ApiDescription({
    tags: ['나의 수업함: 수업별 메모'],
    summary: '수업별 메모 목록',
    description: `
    - 이번학기 수강 중인 과목의 메모 목록
    - 정렬: 과목명 오름차순, 날짜/시간 내림차순
    `,
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: SubjectMemo,
    },
  })
  @Get()
  async getSubjectMemos(
    @ActiveUser() user: UserEntity,
    @Query() params: GetSubjectMemoRequest,
  ): Promise<ResponseListDto<SubjectMemo>> {
    const memos = await this.subjectMemoService.getMemosPaginated(
      user.id,
      params,
    );

    return new ResponseListDto(memos.list, memos.total);
  }

  @ApiDescription({
    tags: ['나의 수업함: 수업별 메모'],
    summary: '오늘 메모 목록',
    description: `
    - 정렬: 과목명 오름차순, 날짜/시간 내림차순
    `,
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: SubjectMemoDetail,
    },
  })
  @Get('today')
  async getTodaySubjectMemos(
    @ActiveUser() user: UserEntity,
  ): Promise<ResponseListDto<SubjectMemoDetail>> {
    const memos = await this.subjectMemoService.getTodayMemos(user.id);

    return new ResponseListDto(memos);
  }

  @ApiBooleanResponse(HttpStatus.CREATED)
  @ApiDescription({
    tags: ['나의 수업함: 수업별 메모'],
    summary: '메모 생성',
    description: `
    - subjectName: 과목명 존재 여부 확인
    - 유저가 해당 학기에 듣는 과목인지 확인`,
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Post()
  async createSubjectMemo(
    @ActiveUser() user: UserEntity,
    @Body() createSubjectMemoDto: CreateSubjectMemoRequest,
  ): Promise<boolean> {
    await this.subjectMemoService.createOne(user, createSubjectMemoDto);

    return true;
  }

  @ApiBooleanResponse(HttpStatus.OK)
  @ApiDescription({
    tags: ['나의 수업함: 수업별 메모'],
    summary: '메모 (제목, 날짜, 내용) 수정',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Patch(':id')
  async updateSubjectMemo(
    @ActiveUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSubjectMemoRequest,
  ): Promise<boolean> {
    await this.subjectMemoService.updateOne(user.id, +id, body);

    return true;
  }

  @ApiBooleanResponse(HttpStatus.OK)
  @ApiDescription({
    tags: ['나의 수업함: 수업별 메모'],
    summary: '메모 삭제',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Delete(':id')
  async deleteSubjectMemo(
    @ActiveUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    await this.subjectMemoService.deleteOne(user.id, +id);

    return true;
  }
}
