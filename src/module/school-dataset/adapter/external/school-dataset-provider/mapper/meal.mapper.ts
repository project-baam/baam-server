import { MealType } from 'src/module/school-dataset/domain/value-objects/meal-type';
import { NeisMealType } from '../constants/neis';

// Neis 데이터를 도메인 형식으로 매핑
const neisToMealTypeMap: Record<NeisMealType, MealType> = {
  [NeisMealType.Breakfast]: MealType.Breakfast,
  [NeisMealType.Lunch]: MealType.Lunch,
  [NeisMealType.Dinner]: MealType.Dinner,
};

// 도메인 데이터를 Neis 형식으로 매핑
const mealTypeToNeisMap: Record<MealType, NeisMealType> = {
  [MealType.Breakfast]: NeisMealType.Breakfast,
  [MealType.Lunch]: NeisMealType.Lunch,
  [MealType.Dinner]: NeisMealType.Dinner,
};

export const toMealType = (neisType: NeisMealType): MealType =>
  neisToMealTypeMap[neisType];
export const toNeisMealType = (mealType: MealType): NeisMealType =>
  mealTypeToNeisMap[mealType];
