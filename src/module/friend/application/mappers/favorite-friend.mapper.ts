import { FavoriteFriendInHome } from './../../domain/friend';
import { FindFavoriteFriendsDto } from '../../adapter/persistence/orm/dto/find-favorite-friends.dto';

export class FavoriteFriendMapper {
  static toDomain(
    dto: FindFavoriteFriendsDto,
    activeClassNow: string | null,
  ): FavoriteFriendInHome {
    return {
      ...dto,
      activeClassNow,
    };
  }

  static mapToDomain(
    dtos: {
      friend: FindFavoriteFriendsDto;
      activeClassNow: string | null;
    }[],
  ): FavoriteFriendInHome[] {
    return dtos.map((dto) => this.toDomain(dto.friend, dto.activeClassNow));
  }
}
