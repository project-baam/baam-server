import { Grade } from './grade';

export enum CurriculumVersion {
  V2015 = '2015',
  V2022 = '2022',
}

export const getCurriculumVersion = (
  year: number,
  grade: Grade,
): CurriculumVersion => {
  switch (year) {
    case 2024:
      return CurriculumVersion.V2015;

    case 2025:
      return grade === Grade.First
        ? CurriculumVersion.V2022
        : CurriculumVersion.V2015;

    case 2026:
      return grade === Grade.Third
        ? CurriculumVersion.V2015
        : CurriculumVersion.V2022;

    case 2027:
      return CurriculumVersion.V2022;
  }

  throw new Error('Unsupported year');
};
