import { Injectable } from '@nestjs/common';
import { Semester } from '../school-dataset/domain/value-objects/semester';

@Injectable()
export class DateUtilService {
  /**
   * 1학기: 2월 1일 ~ 6월 30일
   * 2학기: 7월 1일 ~ 1월 31일
   * @param date
   * @returns
   */
  getYearAndSemesterByDate(date: Date): [year: number, semester: Semester] {
    const month = date.getMonth();
    return [
      date.getFullYear(),
      month >= 1 && month <= 5 ? Semester.First : Semester.Second,
    ];
  }

  /**
   * 현재 학기의 시작일과 종료일을 반환합니다.
   * @returns SemesterRange
   */
  getThisSemesterRange(): [
    start: Date,
    end: Date,
    year: number,
    semester: Semester,
  ] {
    const now = new Date();
    const [year, semester] = this.getYearAndSemesterByDate(now);

    let start: Date, end: Date;

    if (semester === Semester.First) {
      start = new Date(year, 1, 1); // 2월 1일
      end = new Date(year, 5, 30); // 6월 30일
    } else {
      start = new Date(year, 6, 1); // 7월 1일
      end = new Date(year + 1, 0, 31); // 다음 해 1월 31일
    }

    return [start, end, year, semester];
  }
}
