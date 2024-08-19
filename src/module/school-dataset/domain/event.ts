import { Expose } from 'class-transformer';
import { UserGrade } from './value-objects/grade';

export class SchoolEvent {
  @Expose()
  title: string;

  @Expose()
  content: string | null;

  /**
   * @example '2021-01-01'
   */
  @Expose()
  date: string;

  @Expose()
  grade: UserGrade;
}
