import { TimetableService } from './../../timetable/application/timetable.service';
import { PaginatedList } from 'src/common/dto/response.dto';
import { DateUtilService } from 'src/module/util/date-util.service';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import { Injectable } from '@nestjs/common';
import {
  FavoriteFriendInHome,
  FriendDetail,
  FriendRequest,
} from '../domain/friend';
import { FriendRepository } from './port/friend.repository.abstract';
import {
  FriendsResponse,
  GetFavoriteFriendsRequest,
  GetFriendRequestRequest,
  GetFriendsRequest,
  GetSchoolmatesRequest,
  SchoolmatesResponse,
} from '../adapter/presenter/rest/dto/friend.dto';
import { FriendMapper, SchoolmateMapper } from './mappers/friend.mapper';
import { UserTimetableRepository } from 'src/module/timetable/application/repository/user-timetable.repository.abstract';
import { Timetable } from 'src/module/timetable/domain/timetable';
import { UserTimetableEntity } from 'src/module/timetable/adapter/persistence/entities/user-timetable.entity';
import { FavoriteFriendMapper } from './mappers/favorite-friend.mapper';
import dayjs from 'dayjs';
import { TimetableMapper } from 'src/module/timetable/application/mappers/timetable.mapper';
import {
  AlreadyFriendsError,
  ContentNotFoundError,
  DuplicateFriendRequestError,
} from 'src/common/types/error/application-exceptions';
import { FriendRequestStatus } from '../domain/enums/friend-request-status.enum';
import {
  ReceivedFriendRequestsMapper,
  SentFriendRequestsMapper,
} from './mappers/friend-request.mapper';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { Transactional } from 'typeorm-transactional';
import { UserStatus } from 'src/module/user/domain/enum/user-status.enum';
import { FriendshipStatus } from '../domain/enums/friendship-status.enum';
import { FindFriendsDto } from '../adapter/persistence/dto/find-friends.dto';

@Injectable()
export class FriendService {
  constructor(
    private friendRepository: FriendRepository,
    private userRepository: UserRepository,
    private timetableRepository: UserTimetableRepository,
    private dateUtilService: DateUtilService,
    private timetableService: TimetableService,
  ) {}

  private async findSchoolmateOrFail(
    userSchoolId: number,
    friendId: number,
  ): Promise<UserEntity> {
    const friend = await this.userRepository.findOneByIdOrFail(friendId);

    if (
      friend.status !== UserStatus.ACTIVE ||
      userSchoolId !== friend.profile.class.school.id
    ) {
      throw new ContentNotFoundError('schoolmates', friendId);
    }

    return friend;
  }

  async deleteSentFriendRequest(
    userId: number,
    requestId: number,
  ): Promise<void> {
    const request =
      await this.friendRepository.findRequestByIdOrFail(requestId);
    if (request.senderId !== userId) {
      throw new ContentNotFoundError('friend-request', requestId);
    }

    await this.friendRepository.deleteFriendRequest(requestId);
  }

  private async addTimetable(friend: any): Promise<{
    friend: FindFriendsDto;
    timetable: UserTimetableEntity[];
  }> {
    const [year, semester] = this.dateUtilService.getYearAndSemesterByDate(
      new Date(),
    );
    const timetable = await this.timetableRepository.find({
      userId: friend.userId,
      year,
      semester,
    });

    return {
      friend,
      timetable,
    };
  }

  // Favorite Friends 또는 Friend
  private async addFriendsActiveClass<T extends { userId: number }>(
    dto: T[],
  ): Promise<{ friend: T; activeClassNow: string | null }[]> {
    const addFriendActiveClass = (dto: T) => {
      return {
        friend: dto,
        activeClassNow: this.timetableService.getCurrentSubject(dto.userId),
      };
    };

    return Promise.all(
      dto.map((friend) => {
        return addFriendActiveClass(friend);
      }),
    );
  }

  async getFriends(
    userId: number,
    params: GetFriendsRequest,
  ): Promise<FriendsResponse> {
    const result = await this.friendRepository.findFriends(userId, params);

    return new FriendsResponse(
      FriendMapper.mapToDomain(await this.addFriendsActiveClass(result.list)),
      result.total,
      result.initialCounts,
    );
  }

  async getFriendDetail(
    schoolId: number,
    userId: number,
    friendUserId: number,
  ): Promise<FriendDetail> {
    let status: FriendshipStatus;
    const friend = await this.findSchoolmateOrFail(schoolId, friendUserId);
    const isFriend = await this.friendRepository.isFriend(userId, friendUserId);
    if (isFriend) {
      status = FriendshipStatus.FRIENDS;
    } else {
      const friendRequest =
        await this.friendRepository.findFriendRequestBySenderAndReceiver({
          senderId: userId,
          receiverId: friendUserId,
          status: FriendRequestStatus.PENDING,
        });
      if (friendRequest.length) {
        status = FriendshipStatus.REQUEST_SENT;
      } else {
        status = FriendshipStatus.NONE;
      }
    }

    // 친구의 프로필 공개 여부 확인
    const { isClassPublic, isTimetablePublic } = friend.profile;
    let allTimetable: Timetable[] | null;
    let todayTimetable: Timetable[] | null;
    let className: string | null;
    if (isTimetablePublic || isFriend) {
      const friendWithTimetable = await this.addTimetable({
        ...friend,
        userId: friendUserId,
      });

      allTimetable = TimetableMapper.mapToDomain(friendWithTimetable.timetable);
      todayTimetable = allTimetable.filter((timetable) => {
        return timetable.day === dayjs().day();
      });
    } else {
      allTimetable = null;
      todayTimetable = null;
    }
    if (isClassPublic || isFriend) {
      className = friend.profile.class.name;
    } else {
      className = null;
    }

    return {
      isClassPublic,
      className,
      isTimetablePublic,
      allTimetable,
      todayTimetable,
      profileImage: friend.profile.profileImageUrl ?? null,
      profileBackgroundImage: friend.profile.backgroundImageUrl ?? null,
      schoolName: friend.profile.class.school.name,
      grade: friend.profile.class.grade,
      status,
      fullName: friend.profile.fullName,
    };
  }

  async getFavoriteFriends(
    userId: number,
    params: GetFavoriteFriendsRequest,
  ): Promise<PaginatedList<FavoriteFriendInHome>> {
    const favoriteFriends = await this.friendRepository.getFavoriteFriends(
      userId,
      params,
    );

    return {
      list: FavoriteFriendMapper.mapToDomain(
        await this.addFriendsActiveClass(favoriteFriends.list),
      ),
      total: favoriteFriends.total,
    };
  }

  async addFriendRequest(
    schoolId: number,
    userId: number,
    friendId: number,
  ): Promise<void> {
    await this.findSchoolmateOrFail(schoolId, friendId);

    const isAlreadyFriend = await this.friendRepository.isFriend(
      userId,
      friendId,
    );
    if (isAlreadyFriend) {
      throw new AlreadyFriendsError(userId, friendId);
    }

    const sameRequestsInPending =
      await this.friendRepository.findFriendRequestBySenderAndReceiver({
        senderId: userId,
        receiverId: friendId,
        status: FriendRequestStatus.PENDING,
      });

    if (sameRequestsInPending.length) {
      throw new DuplicateFriendRequestError(userId, friendId);
    }

    await this.friendRepository.insertFriendRequest(
      userId,
      friendId,
      FriendRequestStatus.PENDING,
    );
  }

  async getSentRequests(
    userId: number,
    params: GetFriendRequestRequest,
  ): Promise<PaginatedList<FriendRequest>> {
    const result = await this.friendRepository.findFriendRequests(params, {
      status: FriendRequestStatus.PENDING,
      senderId: userId,
    });

    return {
      list: SentFriendRequestsMapper.mapToDomain(result.list),
      total: result.total,
    };
  }

  async getReceivedRequests(
    userId: number,
    params: GetFriendRequestRequest,
  ): Promise<PaginatedList<FriendRequest>> {
    const result = await this.friendRepository.findFriendRequests(params, {
      status: FriendRequestStatus.PENDING,
      receiverId: userId,
    });

    return {
      list: ReceivedFriendRequestsMapper.mapToDomain(result.list),
      total: result.total,
    };
  }

  /**
   * 수락 or 거절은 받은 요청만 가능
   */
  @Transactional()
  async acceptOrRejectFriendRequest(
    userId: number,
    requestId: number,
    accept: boolean,
  ): Promise<void> {
    const friendRequest =
      await this.friendRepository.findRequestByIdOrFail(requestId);
    if (
      friendRequest.receiverId !== userId ||
      friendRequest.status !== FriendRequestStatus.PENDING
    ) {
      throw new ContentNotFoundError('friend-reuqest', requestId);
    }

    const friendId = friendRequest.senderId;

    if (accept) {
      await this.friendRepository.createFriendship(userId, friendId);
    }

    await this.friendRepository.updateFriendRequestStatus(
      requestId,
      accept
        ? FriendRequestStatus.ACCEPTED_BY_RECEIVER
        : FriendRequestStatus.REJECTED,
    );

    // 해당 친구에게 유저도 친구 추가 요청을 보냈는지 확인
    const friendRequestByUser =
      await this.friendRepository.findFriendRequestBySenderAndReceiver({
        senderId: userId,
        receiverId: friendId,
        status: FriendRequestStatus.PENDING,
      });

    // 거절의 경우에는. 상대가 받은 유저의 친구 요청은 그대로 둠
    if (friendRequestByUser.length && accept) {
      await this.friendRepository.updateFriendRequestStatus(
        friendRequestByUser[0].id,
        FriendRequestStatus.ACCEPTED_BY_SENDER,
      );
    }
  }

  async deleteFriend(userId: number, friendId: number): Promise<void> {
    const isFriend = await this.friendRepository.isFriend(userId, friendId);
    if (!isFriend) {
      throw new ContentNotFoundError('friendship', `${userId}-${friendId}`);
    }

    await this.friendRepository.removeFriendShip(userId, friendId);
  }

  async getSchoolmates(
    userId: number,
    schoolId: number,
    params: GetSchoolmatesRequest,
  ): Promise<SchoolmatesResponse> {
    const result = await this.friendRepository.findSchoolmates(
      userId,
      schoolId,
      params,
    );

    return {
      list: SchoolmateMapper.mapToDomain(
        await this.addFriendsActiveClass(result.list),
      ),
      total: result.total,
      initialCounts: result.initialCounts,
    };
  }

  async toggleFavorite(userId: number, friendId: number): Promise<void> {
    const isFriend = await this.friendRepository.isFriend(userId, friendId);
    if (!isFriend) {
      throw new ContentNotFoundError('friendship', `${userId}-${friendId}`);
    }

    await this.friendRepository.toggleFavorite(userId, friendId);
  }
}
