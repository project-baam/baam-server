import { SchoolEntity } from '../../persistence/entities/school.entity';
import { ClassEntity } from '../../persistence/entities/class.entity';

export abstract class SchoolDatasetProvider {
  abstract fetchSchoolData(): Promise<Partial<SchoolEntity>[]>;
  abstract fetchClassData(
    officeName: string,
    schoolName: string,
  ): Promise<Partial<ClassEntity>[] | null>;
}
