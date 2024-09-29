import { FindFriendsDto } from '../../adapter/persistence/orm/dto/find-friends.dto';
import { FindSchoolmateDto } from '../../adapter/persistence/orm/dto/find-school-mates.dto';
import { Friend, Schoolmate } from '../../domain/friend';

export class FriendMapper {
  static toDomain(
    friend: FindFriendsDto,
    activeClassNow: string | null,
  ): Friend {
    return {
      ...friend,
      activeClassNow,
    };
  }

  static mapToDomain(
    dtos: {
      friend: FindFriendsDto;
      activeClassNow: string | null;
    }[],
  ): Friend[] {
    return dtos.map((dto) => this.toDomain(dto.friend, dto.activeClassNow));
  }
}

export class SchoolmateMapper {
  static toDomain(
    friend: FindSchoolmateDto,
    activeClassNow: string | null,
  ): Schoolmate {
    return {
      ...friend,
      activeClassNow,
    };
  }

  static mapToDomain(
    dtos: {
      friend: FindSchoolmateDto;
      activeClassNow: string | null;
    }[],
  ): Schoolmate[] {
    return dtos.map((dto) => this.toDomain(dto.friend, dto.activeClassNow));
  }
}
