import { ClassEntity } from '../../adapter/persistence/orm/entities/class.entity';
import { UserGrade } from '../../domain/value-objects/grade';

export abstract class ClassRepository {
  abstract upsertMany(classes: Partial<ClassEntity>[]): Promise<void>;
  abstract findBySchoolId(schoolId: number): Promise<ClassEntity[]>;
  abstract findBySchoolIdAndGrade(
    schoolId: number,
    grade: UserGrade,
  ): Promise<ClassEntity[]>;
  abstract findByNameAndGrade(
    schoolId: number,
    className: string,
    grade: UserGrade,
  ): Promise<ClassEntity | null>;
  abstract findByNameAndGradeOrFail(
    schoolId: number,
    className: string,
    grade: UserGrade,
  ): Promise<ClassEntity>;
  abstract findAll(): Promise<ClassEntity[]>;
  abstract findByIdOrFail(id: number): Promise<ClassEntity>;
}
