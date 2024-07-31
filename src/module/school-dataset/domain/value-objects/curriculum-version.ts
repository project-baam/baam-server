import { Grade } from './grade';

export enum CurriculumVersion {
  V2015 = '2015',
  V2022 = '2022',
}

export const getCurriculumVersion = (
  year: number,
  grade: Grade,
): CurriculumVersion => {
  const curriculumMap: {
    [key: number]: CurriculumVersion | ((grade: Grade) => CurriculumVersion);
  } = {
    2024: CurriculumVersion.V2015,
    2025: (grade) =>
      grade === Grade.First ? CurriculumVersion.V2022 : CurriculumVersion.V2015,
    2026: (grade) =>
      grade === Grade.Third ? CurriculumVersion.V2015 : CurriculumVersion.V2022,
    2027: CurriculumVersion.V2022,
  };

  const curriculum = curriculumMap[year];
  if (curriculum) {
    return typeof curriculum === 'function' ? curriculum(grade) : curriculum;
  }

  throw new Error(`Unsupported year: ${year}`);
};
