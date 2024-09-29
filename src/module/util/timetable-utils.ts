import dayjs from 'dayjs';
import { Period } from '../timetable/domain/enums/period';
import { UserTimetableEntity } from '../timetable/adapter/persistence/orm/entities/user-timetable.entity';

type TimeInMinutes = number;

interface SchoolTimeSettings {
  firstPeriodStart: string;
  lunchTimeStart: string;
  lunchTimeEnd: string;
}

interface PrecomputedTimes {
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
  let lastCheck: { time: TimeInMinutes; result: string | null } | null = null;

  return (
    optimizedTimetable: Map<string, string>,
    precomputedTimes: PrecomputedTimes,
    currentTime: Date = new Date(),
  ): string | null => {
    const now = dayjs(currentTime);
    const currentMinutes =
      (now.hour() * MINUTES_PER_HOUR + now.minute()) % MINUTES_PER_DAY;

    // 1분 이내의 연속 호출은 이전 결과 반환
    if (lastCheck && Math.abs(currentMinutes - lastCheck.time) < 1) {
      return lastCheck.result;
    }

    const weekday = now.day();

    // 점심 시간 체크
    if (
      currentMinutes >= precomputedTimes.lunchStart &&
      currentMinutes < precomputedTimes.lunchEnd
    ) {
      lastCheck = { time: currentMinutes, result: null };
      return null;
    }

    // 이진 탐색으로 현재 교시 찾기
    let left = 0;
    let right = precomputedTimes.periodStarts.length - 1;
    while (left <= right) {
      const mid = (left + right) >>> 1;
      if (currentMinutes < precomputedTimes.periodStarts[mid]) {
        right = mid - 1;
      } else if (
        mid === precomputedTimes.periodStarts.length - 1 ||
        currentMinutes < precomputedTimes.periodStarts[mid + 1]
      ) {
        // 현재 교시를 찾음
        const currentPeriod = (mid + 1) as Period;
        const result =
          optimizedTimetable.get(`${weekday}-${currentPeriod}`) ?? null;
        lastCheck = { time: currentMinutes, result };
        return result;
      } else {
        left = mid + 1;
      }
    }

    lastCheck = { time: currentMinutes, result: null };
    return null; // 수업 시간이 아님
  };
})();
