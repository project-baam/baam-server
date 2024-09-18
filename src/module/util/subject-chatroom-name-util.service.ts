import { Injectable } from '@nestjs/common';
import { DateUtilService } from './date-util.service';
import {
  ChatRoomNameString,
  ChatRoomNameStructure,
} from '../chat/domain/types/subject-chatroom-name.types';
import { Weekday } from '../timetable/domain/enums/weekday';
import { Period } from '../timetable/domain/enums/period';

@Injectable()
export class ChatRoomNameUtilService {
  constructor(private dateUtilService: DateUtilService) {}

  generateChatRoomName(
    nameStructure: ChatRoomNameStructure,
  ): ChatRoomNameString {
    const { subjectName, schedule } = nameStructure;

    // 1차 정렬: 요일 오름차순, 2차 정렬: 교시 오름차순
    const formattedSchedule = schedule
      .sort((a, b) => a.day - b.day || a.period - b.period)
      .map((session) => this.formatClassSession(session))
      .join(' ');

    return `[${subjectName}] (${formattedSchedule})` as ChatRoomNameString;
  }

  private formatClassSession(session: {
    day: Weekday;
    period: Period;
  }): string {
    const koreanWeekdayShort = this.dateUtilService.getKoreanWeekdayShort(
      session.day,
    );
    return `${koreanWeekdayShort}${session.period}`;
  }
}
