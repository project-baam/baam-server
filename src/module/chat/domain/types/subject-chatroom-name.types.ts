import { Period } from 'src/module/timetable/domain/enums/period';
import { Weekday } from 'src/module/timetable/domain/enums/weekday';

export type WeekdayKorean = '일' | '월' | '화' | '수' | '목' | '금' | '토';

/**
 * 단일 수업 시간
 */
export interface ClassSession {
  day: Weekday;
  period: Period;
}

/**
 * 유니크한 수업 조합(분반)을 나타내는 타입
 */
export type ClassSchedule = ClassSession[];

/**
 * [subjectId, subjectName, ClassSchedule]
 */
export type SubjectSchedule = [number, string, ClassSchedule];

/**
 * 과목 채팅방 이름 구조를 나타내는 타입
 */
export interface ChatRoomNameStructure {
  subjectName: string;
  schedule: ClassSchedule;
}

// 과목 채팅방 이름 문자열 타입 (형식을 나타내는 용도)
export type ChatRoomNameString = `[${string}] (${string})`;
