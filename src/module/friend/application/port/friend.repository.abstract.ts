import {
  GetFavoriteFriendsRequest,
  GetFriendRequestRequest,
  GetFriendsRequest,
  GetSchoolmatesRequest,
} from './../../adapter/presenter/rest/dto/friend.dto';
import { FriendRequestStatus } from '../../domain/enums/friend-request-status.enum';
import { FriendRequestsEntity } from '../../adapter/persistence/orm/entities/friend-requests.entity';
import { PaginatedList } from 'src/common/dto/response.dto';
import { FindFriendsDto } from '../../adapter/persistence/orm/dto/find-friends.dto';
import { FindFavoriteFriendsDto } from '../../adapter/persistence/orm/dto/find-favorite-friends.dto';
import { FindSchoolmateDto } from '../../adapter/persistence/orm/dto/find-school-mates.dto';

export abstract class FriendRepository {
  abstract createFriendship(userId1: number, userId2: number): Promise<void>;

  abstract toggleFavorite(userId: number, friendUserId: number): Promise<void>;

  abstract isFriend(userId1: number, userId2: number): Promise<boolean>;

  abstract removeFriendShip(userId1: number, userId2: number): Promise<void>;

  abstract findFriends(
    userId: number,
    params: GetFriendsRequest,
  ): Promise<
    PaginatedList<FindFriendsDto> & {
      initialCounts: Record<string, number>;
    }
  >;

  abstract getFavoriteFriends(
    userId: number,
    params: GetFavoriteFriendsRequest,
  ): Promise<PaginatedList<FindFavoriteFriendsDto>>;

  abstract findFriendRequests(
    params: GetFriendRequestRequest,
    where: Partial<
      Pick<FriendRequestsEntity, 'status' | 'receiverId' | 'senderId'>
    >,
  ): Promise<PaginatedList<FriendRequestsEntity>>;

  abstract findFriendRequestBySenderAndReceiver(
    conditions: Partial<
      Pick<FriendRequestsEntity, 'status' | 'receiverId' | 'senderId'>
    >,
  ): Promise<FriendRequestsEntity[]>;

  abstract findRequestByIdOrFail(id: number): Promise<FriendRequestsEntity>;

  abstract insertFriendRequest(
    senderId: number,
    receiverId: number,
    status: FriendRequestStatus,
  ): Promise<FriendRequestsEntity>;

  abstract updateFriendRequestStatus(
    id: number,
    status: FriendRequestStatus,
  ): Promise<void>;

  abstract deleteFriendRequest(id: number): Promise<void>;

  abstract findSchoolmates(
    userId: number,
    schoolId: number,
    params: GetSchoolmatesRequest,
  ): Promise<
    PaginatedList<FindSchoolmateDto> & {
      initialCounts: Record<string, number>;
    }
  >;
}
