import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { Timetable } from 'src/module/timetable/domain/timetable';
import { FriendshipStatus } from './enums/friendship-status.enum';

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

  @ApiProperty({ nullable: true, type: 'string' })
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

  @ApiProperty({
    description: '일주일 시간표',
    nullable: true,
    type: [Timetable],
  })
  allTimetable: Timetable[] | null;

  @ApiProperty({
    description: '오늘 시간표',
    nullable: true,
    type: [Timetable],
  })
  todayTimetable: Timetable[] | null;

  @ApiProperty({ description: '프로필 이미지' })
  profileImage: string | null;

  @ApiProperty({ description: '프로필 배경 이미지' })
  profileBackgroundImage: string | null;

  @ApiProperty({ description: '학교 이름' })
  schoolName: string;

  @ApiProperty({ description: '학년' })
  grade: UserGrade;

  @ApiProperty({
    description:
      '친구 상태: Friends(친구), RequestSent(친구 요청 중), None(친구도 아니고 요청도 안 보낸 상태)',
    type: 'enum',
    enum: FriendshipStatus,
  })
  status: FriendshipStatus;

  @ApiProperty()
  fullName: string;
}

export class FavoriteFriendInHome {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  profileImage: string;

  @ApiProperty({ type: 'string' })
  activeClassNow: string | null;
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
