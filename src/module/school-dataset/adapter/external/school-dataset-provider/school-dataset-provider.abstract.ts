import { UpsertDefaultTimetable } from 'src/module/timetable/adapter/persistence/orm/types/default-timetable';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { Dayjs } from 'dayjs';
import { Meal } from 'src/module/school-dataset/domain/meal';
import { SchoolEvent } from 'src/module/school-dataset/domain/event';
import { SchoolEntity } from '../../persistence/orm/entities/school.entity';
import { ClassEntity } from '../../persistence/orm/entities/class.entity';

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
  abstract fetchMealData(
    officeCode: string,
    schoolCode: string,
    fromDate: Dayjs,
    toDate: Dayjs,
  ): Promise<Meal[]>;
  abstract fetchSchoolEvent(
    officeCode: string,
    schoolCode: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<SchoolEvent[]>;
}
