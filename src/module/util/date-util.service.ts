import { Injectable } from '@nestjs/common';
import { Semester } from '../school-dataset/domain/value-objects/semester';

@Injectable()
export class DateUtilService {
  /**
   * 2 ~ 7월까지 1학기, 8 ~ 1월까지 2학기로 구분
   * @param date
   * @returns
   */
  getYearAndSemesterByDate(date: Date): [year: number, semester: Semester] {
    const month = date.getMonth();
    return [
      date.getFullYear(),
      month >= 2 && month <= 7 ? Semester.First : Semester.Second,
    ];
  }
}
