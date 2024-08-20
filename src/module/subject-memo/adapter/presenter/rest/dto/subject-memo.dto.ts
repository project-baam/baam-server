import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/request.dto';
import { SUBJECT_MEMO_VALIDATION } from 'src/module/subject-memo/domain/constants/subject-memo-validation.constants';

export class CreateSubjectMemoRequest {
  @ApiProperty({
    description:
      '현재 시간표이 과목명만 허용\n\
    GET /subject-memo 응답의 subjectName 값',
  })
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({
    description: 'YYYY-MM-DD HH:mm:ss',
    example: '2024-01-01 00:00:00',
  })
  @IsDateString() // YYYY-MM-DD HH:mm:ss
  datetime: Date;

  @ApiProperty({ description: '100자 이내' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(SUBJECT_MEMO_VALIDATION.TITLE_MAX_LENGTH, {
    message: `제목은 ${SUBJECT_MEMO_VALIDATION.TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`,
  })
  title: string;

  @ApiProperty({ required: false, description: '1000자 이내' })
  @IsString()
  @MaxLength(SUBJECT_MEMO_VALIDATION.CONTENT_MAX_LENGTH, {
    message: `내용은 ${SUBJECT_MEMO_VALIDATION.CONTENT_MAX_LENGTH}자를 초과할 수 없습니다.`,
  })
  @IsOptional()
  content?: string;
}

export class GetSubjectMemoRequest extends PaginationDto {}

export class UpdateSubjectMemoRequest {
  @ApiProperty({ required: false, description: '100자 이내' })
  @IsString()
  @IsOptional()
  @MaxLength(SUBJECT_MEMO_VALIDATION.TITLE_MAX_LENGTH, {
    message: `제목은 ${SUBJECT_MEMO_VALIDATION.TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`,
  })
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, description: '1000자 이내' })
  @IsString()
  @IsOptional()
  @MaxLength(SUBJECT_MEMO_VALIDATION.CONTENT_MAX_LENGTH, {
    message: `내용은 ${SUBJECT_MEMO_VALIDATION.CONTENT_MAX_LENGTH}자를 초과할 수 없습니다.`,
  })
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false, description: 'YYYY-MM-DD HH:mm:ss' })
  @IsDateString()
  @IsOptional()
  datetime?: Date;
}
