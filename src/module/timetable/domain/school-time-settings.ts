import { ApiProperty } from '@nestjs/swagger';

export class SchoolTimeSettings {
  @ApiProperty({ nullable: true, example: '08:00' })
  firstPeriodStart: string | null;

  @ApiProperty({
    nullable: true,
    example: '12:00',
  })
  lunchTimeStart: string | null;

  @ApiProperty({
    nullable: true,
    example: '13:00',
  })
  lunchTimeEnd: string | null;
}
