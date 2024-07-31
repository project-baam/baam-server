import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

import { Grade } from 'src/module/school-dataset/domain/value-objects/grade';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { Period } from 'src/module/timetable/domain/value-objects/period';
import { Weekday } from 'src/module/timetable/domain/value-objects/weekday';

export class DefaultTimetableRequest {
  @ApiProperty()
  @IsPositive()
  @Type(() => Number)
  year: number;

  @ApiProperty()
  @IsIn([1, 2])
  @Type(() => Number)
  semester: Semester;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @ApiProperty()
  @IsEnum(Grade)
  @Type(() => Number)
  grade: Grade;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  className: string;
}

export class UserTimetableRequest {
  @ApiProperty({ description: 'yyyy-mm-dd' })
  @IsDateString()
  @Length(10, 10)
  date: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  userId: number; // TODO: 유저 인증 작업 머지 후
  // 쿼리 파라미터가 아닌 헤더의 jwt 로 userId 를 가져오는 방식으로 변경 필요
}

export class EditOrAddTimetableRequest {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  userId: number; // TODO: 유저 인증 작업 머지 후
  // 쿼리 파라미터가 아닌 헤더의 jwt 로 userId 를 가져오는 방식으로 변경 필요

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsIn([1, 2])
  semester: Semester;

  @ApiProperty()
  @IsEnum(Weekday)
  day: Weekday;

  @ApiProperty({ description: '교시, 1~8' })
  @IsEnum(Period)
  period: Period;

  @ApiProperty({ description: '과목명' })
  @IsString()
  @IsNotEmpty()
  subjectName: string;
}

export class DeleteTimetableRequest {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  userId: number; // TODO: 유저 인증 작업 머지 후
  // 쿼리 파라미터가 아닌 헤더의 jwt 로 userId 를 가져오는 방식으로 변경 필요

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  year: number;

  @ApiProperty()
  @IsEnum(Semester)
  @Type(() => Number)
  semester: Semester;

  @ApiProperty()
  @IsEnum(Weekday)
  @Type(() => Number)
  day: Weekday;

  @ApiProperty({ description: '교시, 1~8' })
  @IsEnum(Period)
  @Type(() => Number)
  period: Period;
}
