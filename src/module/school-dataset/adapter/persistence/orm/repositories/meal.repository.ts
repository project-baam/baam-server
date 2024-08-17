import { Dayjs } from 'dayjs';
import { MealRepository } from 'src/module/school-dataset/application/port/meal.repository';
import { Repository } from 'typeorm';
import { MealEntity } from '../../entities/meal.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class OrmMealRepository implements MealRepository {
  constructor(
    @InjectRepository(MealEntity)
    private readonly mealRepository: Repository<MealEntity>,
  ) {}

  async upsertMany(meals: Partial<MealEntity>[]): Promise<void> {
    await this.mealRepository.save(meals);
  }

  async findBySchoolIdAndDate(
    schoolId: number,
    date: Dayjs,
  ): Promise<MealEntity[]> {
    return this.mealRepository.find({
      where: {
        schoolId,
        date: date.format('YYYY-MM-DD'),
      },
    });
  }
}
