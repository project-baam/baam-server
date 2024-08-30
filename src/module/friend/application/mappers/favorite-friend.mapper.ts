import { FavoriteFriendInHome } from './../../domain/friend';
import { FindFavoriteFriendsDto } from '../../adapter/persistence/dto/find-favorite-friends.dto';
import { UserTimetableEntity } from 'src/module/timetable/adapter/persistence/entities/user-timetable.entity';

export class FavoriteFriendMapper {
  static toDomain(
    dto: FindFavoriteFriendsDto,
    timetable: UserTimetableEntity[],
  ): FavoriteFriendInHome {
    const activeClassNow = 'ㅎ_ㅎ'; //  TODO : 기획 확인 필요
    // timetable 로 가져오기
    timetable;
    return {
      ...dto,
      activeClassNow,
    };
  }

  static mapToDomain(
    dtos: {
      friend: FindFavoriteFriendsDto;
      timetable: UserTimetableEntity[];
    }[],
  ): FavoriteFriendInHome[] {
    return dtos.map((dto) => this.toDomain(dto.friend, dto.timetable));
  }
}
