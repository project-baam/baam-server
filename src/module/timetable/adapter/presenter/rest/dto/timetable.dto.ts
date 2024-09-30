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
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';

import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { Period } from 'src/module/timetable/domain/enums/period';
import { Weekday } from 'src/module/timetable/domain/enums/weekday';

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
  schoolId: number;

  @ApiProperty({ enum: UserGrade, type: 'enum' })
  @IsEnum(UserGrade)
  @Type(() => Number)
  grade: UserGrade;

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
}

export class EditOrAddTimetableRequest {
  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsIn([1, 2])
  semester: Semester;

  @ApiProperty()
  @IsEnum(Weekday)
  day: Weekday;

  @ApiProperty({ description: '교시, 1~11' })
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
