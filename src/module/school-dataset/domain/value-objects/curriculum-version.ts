import { UserGrade } from './grade';

export enum CurriculumVersion {
  V2015 = '2015',
  V2022 = '2022',
}

export const getCurriculumVersion = (
  year: number,
  grade: UserGrade,
): CurriculumVersion => {
  const curriculumMap: {
    [key: number]:
      | CurriculumVersion
      | ((grade: UserGrade) => CurriculumVersion);
  } = {
    2024: CurriculumVersion.V2015,
    2025: (grade) =>
      grade === UserGrade.First
        ? CurriculumVersion.V2022
        : CurriculumVersion.V2015,
    2026: (grade) =>
      grade === UserGrade.Third
        ? CurriculumVersion.V2015
        : CurriculumVersion.V2022,
    2027: CurriculumVersion.V2022,
  };

  const curriculum = curriculumMap[year];
  if (curriculum) {
    return typeof curriculum === 'function' ? curriculum(grade) : curriculum;
  }

  throw new Error(`Unsupported year: ${year}`);
};
