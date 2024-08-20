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

  @ApiProperty({ required: false, description: '1000자 이내' })
  @IsOptional()
  @MaxLength(EVENT_VALIDATION.CONTENT_MAX_LENGTH, {
    message: `메모는 ${EVENT_VALIDATION.CONTENT_MAX_LENGTH}00자를 초과할 수 없습니다.`,
  })
  memo?: string;
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
  type?: EventType; // TODO: 학교 일정은 Neis 기반으로 가져오는데, 유저가 임의로 수정하거나 삭제할 수 있는지 확인 필요
  // 우선 학교 일정을 직접 추가할 수 있긴 함(유저가 추가한 학교일정인지, 나이스인지 구분 필요?)

  @ApiProperty({ required: false })
  @MaxLength(EVENT_VALIDATION.CONTENT_MAX_LENGTH, {
    message: `메모는 ${EVENT_VALIDATION.CONTENT_MAX_LENGTH}00자를 초과할 수 없습니다.`,
  })
  @IsOptional()
  memo?: string;
}

export class UpdateEventBodyParams extends OmitType(UpdateEventRequest, [
  'id',
]) {}
