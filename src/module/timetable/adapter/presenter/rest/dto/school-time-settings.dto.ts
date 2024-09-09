import { ApiProperty } from '@nestjs/swagger';
import { IsMilitaryTime } from 'class-validator';

export class SchoolTimeSettingsUpsertRequest {
  @ApiProperty({
    description:
      '1교시 시작 시간, HH:MM 형식\n\
    00:00 ~ 23:59',
    example: '09:00',
  })
  @IsMilitaryTime()
  firstPeriodStart: string;

  @ApiProperty({
    description:
      '점심 시간 시작, HH:MM 형식\n\
    00:00 ~ 23:59',
    example: '12:00',
  })
  @IsMilitaryTime()
  lunchTimeStart: string;

  @ApiProperty({
    description:
      '점심 시간 종료, HH:MM 형식\n\
    00:00 ~ 23:59',
    example: '13:00',
  })
  @IsMilitaryTime()
  lunchTimeEnd: string;
}
