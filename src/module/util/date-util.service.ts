import { Injectable } from '@nestjs/common';
import { Semester } from '../school-dataset/domain/value-objects/semester';
import { Weekday } from '../timetable/domain/enums/weekday';

@Injectable()
export class DateUtilService {
  /**
   * 1학기: 2월 1일 ~ 7월 31일
   * 2학기: 8월 1일 ~ 1월 31일
   * @param date
   * @returns
   */
  getYearAndSemesterByDate(date: Date): [year: number, semester: Semester] {
    const month = date.getMonth();
    return [
      date.getFullYear(),
      month >= 1 && month <= 6 ? Semester.First : Semester.Second,
    ];
  }

  /**
   * 현재 학기의 시작일과 종료일을 반환합니다.
   * @returns 1학기: 2월 1일 ~ 7월 31일, 2학기: 8월 1일 ~ 1월 31일
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
      end = new Date(year, 6, 31); // 7월 31일
    } else {
      start = new Date(year, 7, 1); // 8월 1일
      end = new Date(year + 1, 0, 31); // 다음 해 1월 31일
    }

    return [start, end, year, semester];
  }

  getKoreanWeekday(day: Weekday): string {
    const weekdaysInKorean = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];

    return weekdaysInKorean[day];
  }

  getKoreanWeekdayShort(day: Weekday): string {
    return this.getKoreanWeekday(day).at(0) as string;
  }
}
