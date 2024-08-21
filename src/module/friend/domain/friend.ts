import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { Timetable } from 'src/module/timetable/domain/timetable';

export class Friend {
  userId: number;
  name: string;
  profileImage: string;
  grade: UserGrade; // TODO: 기획에는 없지만, 필요할 것 같아서 추가함.(추후 삭제)
  className: string;
  isFavorite: boolean;
  activeClassNow: string;
  initial: string;
}

export class FriendDetail extends Friend {
  profileBackgroundImage: string;
  schoolName: string;
  allTimetable: Timetable[];
  todalTimetable: Timetable[];
}

export class FavoriteFriendInHome {
  name: string;
  profileImage: string;
  activeClassNow: string;
}

export class FriendRequest {
  friendName: string;
  friendProfileImage: string;
  grade: UserGrade;
  className: string;
  requestedAt: Date;
}
