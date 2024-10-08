import dayjs from 'dayjs';
import { Period } from '../timetable/domain/enums/period';
import { UserTimetableEntity } from '../timetable/adapter/persistence/orm/entities/user-timetable.entity';
import { CurrentSubjectInfo } from '../timetable/adapter/presenter/rest/dto/current-subject-info.dto';

type TimeInMinutes = number;

interface SchoolTimeSettings {
  firstPeriodStart: string;
  lunchTimeStart: string;
  lunchTimeEnd: string;
}

export interface PrecomputedTimes {
  readonly periodStarts: readonly TimeInMinutes[];
  readonly lunchStart: TimeInMinutes;
  readonly lunchEnd: TimeInMinutes;
  readonly lunchPeriod: Period;
}

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

const timeToMinutes = (time: string): TimeInMinutes => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};

export const precomputeTimes = (
  timeSettings: SchoolTimeSettings,
): PrecomputedTimes => {
  const firstPeriodStart = timeToMinutes(timeSettings.firstPeriodStart);
  const lunchStart = timeToMinutes(timeSettings.lunchTimeStart);
  const lunchEnd = timeToMinutes(timeSettings.lunchTimeEnd);

  const periodStarts: TimeInMinutes[] = new Array(Period.Eleventh);
  let currentPeriod = 0;
  let currentTime = firstPeriodStart;

  while (currentTime < lunchStart && currentPeriod < Period.Eleventh) {
    periodStarts[currentPeriod] = currentTime;
    currentTime += MINUTES_PER_HOUR;
    currentPeriod++;
  }

  const lunchPeriod = currentPeriod as Period;

  while (currentPeriod < Period.Eleventh) {
    periodStarts[currentPeriod] = Math.max(currentTime, lunchEnd);
    currentTime = periodStarts[currentPeriod] + MINUTES_PER_HOUR;
    currentPeriod++;
  }

  return {
    periodStarts: Object.freeze(periodStarts),
    lunchStart,
    lunchEnd,
    lunchPeriod,
  };
};

export const optimizeTimetable = (
  timetable: UserTimetableEntity[],
): Map<string, string> => {
  return new Map(
    timetable.map((item) => [`${item.day}-${item.period}`, item.subject.name]),
  );
};

export const memoizedGetCurrentSubject = (() => {
  let lastCheck: { time: number; result: string | null } | null = null;

  return (
    optimizedTimetable: Map<string, string>,
    precomputedTimes: PrecomputedTimes,
    currentTime: Date = new Date(),
  ): string | null => {
    const now = dayjs(currentTime);
    const currentMinutes =
      (now.hour() * MINUTES_PER_HOUR + now.minute()) % MINUTES_PER_DAY;

    // 1분 이내의 연속 호출은 이전 결과 반환
    // if (lastCheck && Math.abs(currentMinutes - lastCheck.time) < 1) {
    //   return lastCheck.result; // TODO: null 반환 이슈로 잠시 주석 처리
    // }

    const weekday = now.day();

    // 수업 시간 이전 또는 이후 체크
    if (
      currentMinutes < precomputedTimes.periodStarts[0] ||
      currentMinutes >=
        precomputedTimes.periodStarts[
          precomputedTimes.periodStarts.length - 1
        ] +
          60
    ) {
      lastCheck = { time: currentMinutes, result: null };
      return null;
    }

    // 점심 시간 체크
    if (
      currentMinutes >= precomputedTimes.lunchStart &&
      currentMinutes < precomputedTimes.lunchEnd
    ) {
      lastCheck = { time: currentMinutes, result: null };
      return null;
    }

    // 현재 교시 찾기
    for (let i = 0; i < precomputedTimes.periodStarts.length; i++) {
      if (currentMinutes < precomputedTimes.periodStarts[i] + 60) {
        const result = optimizedTimetable.get(`${weekday}-${i + 1}`) ?? null;
        lastCheck = { time: currentMinutes, result };
        return result;
      }
    }

    // 여기까지 오면 수업 시간이 아님
    lastCheck = { time: currentMinutes, result: null };
    return null;
  };
})();

export const memoizedGetCurrentSubjectWithTimes = (() => {
  let lastCheck: { time: number; result: CurrentSubjectInfo } | null = null;

  return (
    optimizedTimetable: Map<string, string>,
    precomputedTimes: PrecomputedTimes,
    currentTime: Date = new Date(),
  ): CurrentSubjectInfo => {
    const now = dayjs(currentTime);
    const currentMinutes = now.hour() * MINUTES_PER_HOUR + now.minute();

    if (lastCheck && Math.abs(currentMinutes - lastCheck.time) < 1) {
      return lastCheck.result;
    }

    const weekday = now.day();

    if (
      currentMinutes < precomputedTimes.periodStarts[0] ||
      currentMinutes >=
        precomputedTimes.periodStarts[
          precomputedTimes.periodStarts.length - 1
        ] +
          60
    ) {
      lastCheck = {
        time: currentMinutes,
        result: { subject: null, startTime: null, endTime: null },
      };
      return lastCheck.result;
    }

    if (
      currentMinutes >= precomputedTimes.lunchStart &&
      currentMinutes < precomputedTimes.lunchEnd
    ) {
      lastCheck = {
        time: currentMinutes,
        result: { subject: null, startTime: null, endTime: null },
      };
      return lastCheck.result;
    }

    for (let i = 0; i < precomputedTimes.periodStarts.length; i++) {
      if (currentMinutes < precomputedTimes.periodStarts[i] + 60) {
        const subject = optimizedTimetable.get(`${weekday}-${i + 1}`) ?? null;
        const startTime = now
          .startOf('day')
          .add(precomputedTimes.periodStarts[i], 'minute')
          .toDate();
        const endTime = dayjs(startTime).add(1, 'hour').toDate();

        const result = {
          subject,
          startTime: dayjs(startTime).format('YYYY-MM-DD HH:mm:ss'),
          endTime: dayjs(endTime).format('YYYY-MM-DD HH:mm:ss'),
        };
        lastCheck = { time: currentMinutes, result };
        return result;
      }
    }

    lastCheck = {
      time: currentMinutes,
      result: { subject: null, startTime: null, endTime: null },
    };
    return lastCheck.result;
  };
})();
