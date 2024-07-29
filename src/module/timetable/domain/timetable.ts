import { Expose } from 'class-transformer';
import { Period } from './value-objects/period';
import { Weekday } from './value-objects/weekday';
import { ApiProperty } from '@nestjs/swagger';

export class Timetable {
  @Expose()
  @ApiProperty({ description: '요일(0: 일요일, 1: 월요일, ..., 6: 토요일)' })
  day: Weekday;

  @Expose()
  @ApiProperty({ description: '교시(1: 1교시, 2: 2교시, ..., 8: 8교시)' })
  period: Period;

  @Expose()
  @ApiProperty({ description: '과목명' })
  subject: string;
}
