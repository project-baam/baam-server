import { ClassEntity } from '../../adapter/persistence/entities/class.entity';
import { Grade } from '../../domain/value-objects/grade';

export abstract class ClassRepository {
  abstract upsertMany(classes: Partial<ClassEntity>[]): Promise<void>;
  abstract findBySchoolId(schoolId: number): Promise<ClassEntity[] | null>;
  abstract findBySchoolIdAndGrade(
    schoolId: number,
    grade: Grade,
  ): Promise<ClassEntity[] | null>;
  abstract findByNameAndGrade(
    schoolName: string,
    className: string,
    grade: Grade,
  ): Promise<ClassEntity | null>;
}
