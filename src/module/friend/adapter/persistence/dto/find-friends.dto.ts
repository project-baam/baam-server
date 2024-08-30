import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';

export class FindFriendsDto {
  userId: number;
  fullName: string;
  profileImage: string;
  grade: UserGrade;
  className: string;
  isFavorite: boolean;
  initial: string;
}
