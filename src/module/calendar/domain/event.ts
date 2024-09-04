import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum EventType {
  SCHOOL = 'school',
  CLASS = 'class',
  PERSONAL = 'personal',
}

export class Event {
  @ApiProperty()
  @Expose()
  readonly id: number;

  @ApiProperty()
  @Expose()
  readonly title: string;
  /**
   * yyyy-MM-dd HH:mm:ss
   */
  @ApiProperty({ description: 'yyyy-MM-dd HH:mm:ss' })
  @Expose()
  readonly datetime: string;

  @ApiProperty({ type: 'enum', enum: EventType })
  @Expose()
  readonly type: EventType;

  @ApiProperty({ required: false })
  @Expose()
  readonly memo?: string;

  @ApiProperty({ required: false })
  @Expose()
  readonly subjectName: string;
}
