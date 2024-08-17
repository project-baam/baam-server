import { Expose } from 'class-transformer';
import { MealType } from './value-objects/meal-type';
import { ApiProperty } from '@nestjs/swagger';

// 급식
export class Meal {
  @Expose()
  @ApiProperty({ example: '2021-09-01' })
  date: string; // YYYY-MM-DD

  @Expose()
  @ApiProperty({ type: 'enum', enum: MealType })
  type: MealType;

  @Expose()
  @ApiProperty({
    example: ['김치볶음밥', '흑미밥', '미역국', '콩나물무침', '포기김치'],
  })
  menu: string[];
}
