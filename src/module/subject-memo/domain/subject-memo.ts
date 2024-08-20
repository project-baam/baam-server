import { Expose, Type } from 'class-transformer';
import { SubjectMemoDetail } from './subjet-memo-detail';
import { ApiProperty } from '@nestjs/swagger';

export class SubjectMemo {
  @ApiProperty()
  @Expose()
  readonly subjectName: string;

  @ApiProperty({ type: [SubjectMemoDetail] })
  @Type(() => SubjectMemoDetail)
  @Expose()
  readonly memos: SubjectMemoDetail[];
}
