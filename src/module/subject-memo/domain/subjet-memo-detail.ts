import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SubjectMemoDetail {
  @ApiProperty()
  @Expose()
  readonly id: number;

  @ApiProperty()
  @Expose()
  readonly subjectName: string;

  @ApiProperty()
  @Expose()
  readonly title: string;

  @ApiProperty()
  @Expose()
  readonly memo: string | null;

  /**
   * YYYY-MM-DD HH:mm:ss
   */
  @ApiProperty()
  @Expose()
  readonly datetime: string;
}
