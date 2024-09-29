import { Dayjs } from 'dayjs';
import { MealEntity } from '../../adapter/persistence/orm/entities/meal.entity';

export abstract class MealRepository {
  abstract upsertMany(classes: Partial<MealEntity>[]): Promise<void>;
  abstract findBySchoolIdAndDate(
    schoolId: number,
    date: Dayjs,
  ): Promise<MealEntity[]>;
}
