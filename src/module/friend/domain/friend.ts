import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { Timetable } from 'src/module/timetable/domain/timetable';

export class Friend {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  profileImage: string;

  @ApiProperty({ type: 'enum', enum: UserGrade })
  grade: UserGrade; // TODO: 기획에는 없지만, 필요할 것 같아서 추가함.(추후 삭제)

  @ApiProperty()
  className: string;

  @ApiProperty()
  isFavorite: boolean;

  @ApiProperty({ nullable: true })
  activeClassNow: string | null; // 시간표를 등록한 친구만 해당

  @ApiProperty()
  initial: string;
}

export class Schoolmate extends OmitType(Friend, ['isFavorite']) {}

export class FriendDetail {
  @ApiProperty({ description: '반 전체 공개 여부' })
  isClassPublic: boolean;

  @ApiProperty({ description: '반', nullable: true })
  className: string | null;

  @ApiProperty({ description: '시간표 전체 공개 여부' })
  isTimetablePublic: boolean;

  @ApiProperty({ description: '일주일 시간표', nullable: true })
  allTimetable: Timetable[] | null;

  @ApiProperty({ description: '오늘 시간표', nullable: true })
  todayTimetable: Timetable[] | null;

  @ApiProperty({ description: '프로필 이미지' })
  profileImage: string | null;

  @ApiProperty({ description: '프로필 배경 이미지' })
  profileBackgroundImage: string | null;

  @ApiProperty({ description: '학교 이름' })
  schoolName: string;

  @ApiProperty({ description: '학년' })
  grade: UserGrade;
}

export class FavoriteFriendInHome {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  activeClassNow: string;
}

export class FriendRequest {
  @ApiProperty()
  id: number;

  @ApiProperty({ description: '친구의 userId(프로필 검색시 활용)' })
  userId: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  friendProfileImage: string | null;

  @ApiProperty({ type: 'enum', enum: UserGrade })
  grade: UserGrade;

  @ApiProperty({ nullable: true, description: '반이 친구 공개일 경우 null' })
  className: string | null;

  @ApiProperty()
  requestedAt: Date;
}
