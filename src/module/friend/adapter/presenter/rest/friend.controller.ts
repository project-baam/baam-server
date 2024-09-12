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
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import {
  FavoriteFriendInHome,
  FriendDetail,
  FriendRequest,
} from 'src/module/friend/domain/friend';
import {
  AcceptOrRejectFriendRequestRequest,
  FriendsResponse,
  GetFavoriteFriendsRequest,
  GetFriendRequestRequest,
  GetFriendsRequest,
  GetSchoolmatesRequest,
  SchoolmatesResponse,
} from './dto/friend.dto';
import { ApiBooleanResponse } from 'src/docs/decorator/api-boolean-response';
import { FriendService } from 'src/module/friend/application/friend.service';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { convertSearchInitialToDBInitial } from 'src/module/util/name-util.service';
import {
  AlreadyFriendsError,
  ContentNotFoundError,
  DuplicateFriendRequestError,
  SelfFriendRequestError,
} from 'src/common/types/error/application-exceptions';
import { AuthorizationToken } from 'src/docs/constant/authorization-token';

@RestApi()
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @ApiDescription({
    tags: ['친구'],
    summary: '친구 목록',
    auth: AuthorizationToken.BearerUserToken,
    description:
      '이름, 초성 검색\n\
    - 정렬: 이름 > 학년 > 반 오름차순',
    dataResponse: {
      status: HttpStatus.OK,
      schema: FriendsResponse,
    },
  })
  @Get('friends')
  async getFriends(
    @ActiveUser() user: UserEntity,
    @Query() params: GetFriendsRequest,
  ): Promise<FriendsResponse> {
    return await this.friendService.getFriends(user.id, {
      ...params,
      initials: params?.initials?.map((value) => {
        return String.fromCharCode(convertSearchInitialToDBInitial(value));
      }),
    });
  }

  @ApiDescription({
    tags: ['친구'],
    summary: '즐겨찾기 친구 목록(홈화면에서 사용)',
    description: '즐겨찾기 친구 목록',
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: FavoriteFriendInHome,
    },
  })
  @Get('friends/favorites')
  async getFavoriteFriends(
    @ActiveUser() user: UserEntity,
    @Query() params: GetFavoriteFriendsRequest,
  ): Promise<ResponseListDto<FavoriteFriendInHome>> {
    return await this.friendService.getFavoriteFriends(user.id, params);
  }

  @ApiDescription({
    tags: ['친구'],
    summary: '같은 학교 유저 목록',
    auth: AuthorizationToken.BearerUserToken,
    description:
      '이름, 초성, 학년 검색\n\
    - 정렬: 이름 > 학년 > 반 오름차순',
    dataResponse: {
      status: HttpStatus.OK,
      schema: SchoolmatesResponse,
    },
  })
  @Get('schoolmates')
  async getSchoolmates(
    @ActiveUser() user: UserEntity,
    @Query() params: GetSchoolmatesRequest,
  ): Promise<SchoolmatesResponse> {
    return this.friendService.getSchoolmates(
      user.id,
      user.profile.class.schoolId,
      params,
    );
  }

  @ApiDescription({
    tags: ['친구'],
    summary: '친구 상세 정보',
    description:
      '\n\
    - 시간표가 등록되지 않은 경우\n\
    - 권한이 없어서 조회할 수 없는 경우(친구공개인데 친구사이가 아님)\n\
    두 경우를 구분해야하므로, isClassPublic(반 공개 여부), isTimetablePublic(시간표 공개 여부) 필드를 포함\n\
    - isTimetablePublic = true 이지만 시간표가 없는 경우, allTimetable, todalTimetable은 빈 배열\n\
    - isTimetablePublic = false ->  allTimetable, todalTimetable은 null\n\
    - isClassPublic이 false라면 className은 null\n\
    ',
    auth: AuthorizationToken.BearerUserToken,
    dataResponse: {
      status: HttpStatus.OK,
      schema: FriendDetail,
    },
    exceptions: [ContentNotFoundError],
  })
  @Get('friends/detail/:friendUserId')
  async getFriend(
    @ActiveUser() user: UserEntity,
    @Param('friendUserId', ParseIntPipe) friendUserId: number,
  ): Promise<FriendDetail> {
    return this.friendService.getFriendDetail(
      user.profile.class.schoolId,
      user.id,
      friendUserId,
    );
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['친구 요청'],
    summary: '친구 추가 요청',
    description:
      '\n\
    - 없는 유저의 id 입력시 404, 4040\n\
    - 이미 친구인 경우 409, 4091\n\
    - 자기 자신에게 친구 추가 요청시 409, 4092\n\
    - 이미 친구 추가 요청을 보낸 경우 409, 4093\n',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [
      SelfFriendRequestError,
      DuplicateFriendRequestError,
      AlreadyFriendsError,
      ContentNotFoundError,
    ],
  })
  @Post('friend-requests/:friendUserId')
  async addFriendRequest(
    @ActiveUser() user: UserEntity,
    @Param('friendUserId', ParseIntPipe) friendUserId: number,
  ): Promise<boolean> {
    if (user.id === friendUserId) {
      throw new SelfFriendRequestError(user.id);
    }
    await this.friendService.addFriendRequest(user, friendUserId);

    return true;
  }

  @ApiDescription({
    tags: ['친구 요청'],
    summary: '유저"가" 친구 추가 요청한 **대기** 목록',
    description:
      '친구가 수락/거절하면 리스트에서 제외됨\n\
    검색 조건있는지 확인 필요... ',
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: FriendRequest,
    },
  })
  @Get('friend-requests/sent')
  async getSentRequests(
    @ActiveUser() user: UserEntity,
    @Query() params: GetFriendRequestRequest,
  ): Promise<ResponseListDto<FriendRequest>> {
    const { list, total } = await this.friendService.getSentRequests(
      user.id,
      params,
    );

    return new ResponseListDto(list, total);
  }

  @ApiDescription({
    tags: ['친구 요청'],
    summary: '유저"에게" 친구 추가 요청한 **대기** 목록',
    description:
      '유저가 수락/거절 하면 리스트에서 제외됨\n\
    검색 조건있는지 확인 필요... ',
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: FriendRequest,
    },
  })
  @Get('friend-requests/received')
  async getReceivedRequests(
    @ActiveUser() user: UserEntity,
    @Query() params: GetFriendRequestRequest,
  ): Promise<ResponseListDto<FriendRequest>> {
    const { list, total } = await this.friendService.getReceivedRequests(
      user.id,
      params,
    );

    return new ResponseListDto(list, total);
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['친구 요청'],
    summary: '친구 추가 대기 수락/거절',
    description: '친구 추가 대기 수락/거절',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Patch('friend-requests/:requestId')
  async acceptOrRejectFriendRequest(
    @ActiveUser() user: UserEntity,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() body: AcceptOrRejectFriendRequestRequest,
  ): Promise<boolean> {
    await this.friendService.acceptOrRejectFriendRequest(
      user.id,
      requestId,
      body.accept,
    );

    return true;
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['친구 요청'],
    summary: '보낸 친구 요청 삭제',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Delete('friend-requests/:requestId')
  async deleteSentFriendRequest(
    @ActiveUser() user: UserEntity,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<boolean> {
    await this.friendService.deleteSentFriendRequest(user.id, requestId);

    return true;
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['친구'],
    summary: '친구 삭제(서로 삭제됨)',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Delete('friends/:friendUserId')
  async deleteFriend(
    @ActiveUser() user: UserEntity,
    @Param('friendUserId', ParseIntPipe) friendUserId: number,
  ): Promise<boolean> {
    await this.friendService.deleteFriend(user.id, friendUserId);

    return true;
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['친구'],
    summary: '즐겨찾기 토글',
    description:
      '친구를 즐겨찾기에 추가하거나 제거함, 현재 상태의 반대로 변경됨.',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Patch('friends/:friendUserId/favorite')
  async toggleFavorite(
    @ActiveUser() user: UserEntity,
    @Param('friendUserId') friendUserId: number,
  ): Promise<boolean> {
    await this.friendService.toggleFavorite(user.id, friendUserId);

    return true;
  }
}
