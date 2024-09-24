import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EVENT_VALIDATION } from 'src/module/calendar/domain/constants/event-validation.constants';
import { EventType } from 'src/module/calendar/domain/event';

export class GetMonthEventsRequest {
  @ApiProperty()
  @IsPositive()
  @Type(() => Number)
  year: number;

  @ApiProperty({ description: '0(1월) ~ 11(12월)' })
  @Max(11)
  @Min(0)
  @Type(() => Number)
  month: number;
}

export class CreateEventRequest {
  @ApiProperty({
    description: 'YYYY-MM-DD HH:mm:ss',
    example: '2024-01-01 00:00:00',
  })
  @IsDateString() // YYYY-MM-DD HH:mm:ss
  datetime: string;

  @ApiProperty({ description: '100자 이내' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(EVENT_VALIDATION.TITLE_MAX_LENGTH, {
    message: `제목은 ${EVENT_VALIDATION.TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`,
  })
  title: string;

  @ApiProperty({ type: 'enum', enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    required: false,
    description: `${EVENT_VALIDATION.CONTENT_MAX_LENGTH} 이내 `,
  })
  @IsOptional()
  @MaxLength(EVENT_VALIDATION.CONTENT_MAX_LENGTH, {
    message: `메모는 ${EVENT_VALIDATION.CONTENT_MAX_LENGTH}00자를 초과할 수 없습니다.`,
  })
  memo?: string;

  @ApiProperty({
    description:
      'class Type의 일정만 필요함\n\n\
      현재 시간표이 과목명만 허용\n\
    GET /timetable/subjects 응답값 중 하나',
    required: false,
  })
  @IsString()
  @IsOptional()
  subjectName?: string;
}

export class UpdateEventRequest {
  @ApiProperty()
  @IsPositive()
  @Type(() => Number)
  id: number;

  @ApiProperty({
    required: false,
    description: 'YYYY-MM-DD HH:mm:ss',
    example: '2024-01-01 00:00:00',
  })
  @IsDateString()
  @IsOptional()
  datetime?: string | Date;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  @MaxLength(EVENT_VALIDATION.TITLE_MAX_LENGTH, {
    message: `제목은 ${EVENT_VALIDATION.TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`,
  })
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, type: 'enum', enum: EventType })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @ApiProperty({ required: false })
  @MaxLength(EVENT_VALIDATION.CONTENT_MAX_LENGTH, {
    message: `메모는 ${EVENT_VALIDATION.CONTENT_MAX_LENGTH}00자를 초과할 수 없습니다.`,
  })
  @IsOptional()
  memo?: string;

  @ApiProperty({
    description:
      'class Type의 일정만 필요함\n\n\
      현재 시간표이 과목명만 허용\n\
    GET /timetable/subjects 응답값 중 하나',
    required: false,
  })
  @IsString()
  @IsOptional()
  subjectName?: string;
}

export class UpdateEventBodyParams extends OmitType(UpdateEventRequest, [
  'id',
]) {}
