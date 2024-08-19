const NEIS_BASE_URL = 'https://open.neis.go.kr/hub';

export enum NeisCategory {
  Timetable = 'hisTimetable',
  SchoolInfo = 'schoolInfo',
  ClassInfo = 'classInfo',
  MealInfo = 'mealServiceDietInfo',
  SchoolSchedule = 'SchoolSchedule',
}

export const NeisUri: { [key in NeisCategory]: string } = {
  [NeisCategory.Timetable]: [NEIS_BASE_URL, NeisCategory.Timetable].join('/'),
  [NeisCategory.SchoolInfo]: [NEIS_BASE_URL, NeisCategory.SchoolInfo].join('/'),
  [NeisCategory.ClassInfo]: [NEIS_BASE_URL, NeisCategory.ClassInfo].join('/'),
  [NeisCategory.MealInfo]: [NEIS_BASE_URL, NeisCategory.MealInfo].join('/'),
  [NeisCategory.SchoolSchedule]: [
    NEIS_BASE_URL,
    NeisCategory.SchoolSchedule,
  ].join('/'),
};

export const NEIS_MAX_PAGE_SIZE = 1000;

export enum NeisSuccessCode {
  Ok = 'INFO-000',
  ReferenceOnly = 'INFO-100',
  KeyRestricted = 'INFO-300',
  NoData = 'INFO-200',
}

export enum NeisMealType {
  Breakfast = '1',
  Lunch = '2',
  Dinner = '3',
}
