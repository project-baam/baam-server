import { FindFriendsDto } from '../../adapter/persistence/dto/find-friends.dto';
import { FindSchoolmateDto } from '../../adapter/persistence/dto/find-school-mates.dto';
import { Friend, Schoolmate } from '../../domain/friend';
import { UserTimetableEntity } from 'src/module/timetable/adapter/persistence/entities/user-timetable.entity';

export class FriendMapper {
  static toDomain(
    friend: FindFriendsDto,
    timetable: UserTimetableEntity[],
  ): Friend {
    const activeClassNow = 'ㅎ_ㅎ'; //  TODO : 기획 확인 필요
    // timetable 로 가져오기
    timetable;
    return {
      ...friend,
      activeClassNow,
    };
  }

  static mapToDomain(
    dtos: {
      friend: FindFriendsDto;
      timetable: UserTimetableEntity[];
    }[],
  ): Friend[] {
    return dtos.map((dto) => this.toDomain(dto.friend, dto.timetable));
  }
}

export class SchoolmateMapper {
  static toDomain(
    friend: FindSchoolmateDto,
    timetable: UserTimetableEntity[],
  ): Schoolmate {
    const activeClassNow = 'ㅎ_ㅎ'; //  TODO : 기획 확인 필요
    // timetable 로 가져오기
    timetable;
    return {
      ...friend,
      activeClassNow,
    };
  }

  static mapToDomain(
    dtos: {
      friend: FindSchoolmateDto;
      timetable: UserTimetableEntity[];
    }[],
  ): Schoolmate[] {
    return dtos.map((dto) => this.toDomain(dto.friend, dto.timetable));
  }
}
