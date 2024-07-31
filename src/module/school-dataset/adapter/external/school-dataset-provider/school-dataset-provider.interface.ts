import { SchoolEntity } from '../../persistence/entities/school.entity';
import { ClassEntity } from '../../persistence/entities/class.entity';
import { UpsertDefaultTimetable } from 'src/module/timetable/adapter/persistence/types/default-timetable';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';

export abstract class SchoolDatasetProvider {
  abstract fetchSchoolData(): Promise<Partial<SchoolEntity>[]>;
  abstract fetchClassData(
    officeName: string,
    schoolName: string,
  ): Promise<Partial<ClassEntity>[] | null>;
  abstract fetchDefaultTimetable(
    year: number,
    semester: Semester,
    officeCode: string,
    schoolCode: string,
    grade: number,
    className: string,
  ): Promise<Omit<UpsertDefaultTimetable, 'classId'>[]>;
}
