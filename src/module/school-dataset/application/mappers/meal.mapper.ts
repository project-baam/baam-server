import { plainToInstance } from 'class-transformer';
import { Meal } from '../../domain/meal';
import { MealEntity } from '../../adapter/persistence/orm/entities/meal.entity';

export class MealMapper {
  static toDomain(mealEntity: MealEntity): Meal {
    return plainToInstance(Meal, mealEntity, {
      excludeExtraneousValues: true,
    });
  }

  static toPersistence(
    meal: Pick<MealEntity, 'type' | 'date' | 'menu'>,
    schoolId: number,
  ): Pick<MealEntity, 'type' | 'date' | 'menu' | 'schoolId'> {
    return Object.assign(meal, { schoolId });
  }
}
