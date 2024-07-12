const NEIS_BASE_URL = 'https://open.neis.go.kr/hub';

export enum NeisCategory {
  Timetable = 'hisTimetable',
  SchoolInfo = 'schoolInfo',
}

export const NeisUri: { [key in NeisCategory]: string } = {
  [NeisCategory.Timetable]: [NEIS_BASE_URL, NeisCategory.Timetable].join('/'),
  [NeisCategory.SchoolInfo]: [NEIS_BASE_URL, NeisCategory.SchoolInfo].join('/'),
};

export const NEIS_MAX_PAGE_SIZE = 1000;

export enum NeisSuccessCode {
  Ok = 'INFO-000',
  ReferenceOnly = 'INFO-100',
  KeyRestricted = 'INFO-300',
  NoData = 'INFO-200',
}
