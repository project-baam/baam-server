import { FriendRequestsEntity } from '../../adapter/persistence/orm/entities/friend-requests.entity';
import { FriendRequest } from '../../domain/friend';

export class ReceivedFriendRequestsMapper {
  static mapToDomain(entities: FriendRequestsEntity[]): FriendRequest[] {
    return entities.map((entity) => {
      return {
        id: entity.id,
        userId: entity.senderId,
        fullName: entity.sender.fullName,
        friendProfileImage: entity.sender.profileImageUrl ?? null,
        grade: entity.sender.class.grade,
        className: entity.sender.isClassPublic
          ? entity.sender.class.name
          : null,
        requestedAt: entity.createdAt,
      };
    });
  }
}

export class SentFriendRequestsMapper {
  static mapToDomain(entities: FriendRequestsEntity[]): FriendRequest[] {
    return entities.map((entity) => {
      return {
        id: entity.id,
        userId: entity.receiverId,
        fullName: entity.receiver.fullName,
        friendProfileImage: entity.receiver.profileImageUrl ?? null,
        grade: entity.receiver.class.grade,
        className: entity.receiver.isClassPublic
          ? entity.receiver.class.name
          : null,
        requestedAt: entity.createdAt,
      };
    });
  }
}
