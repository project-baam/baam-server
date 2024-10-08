import { ApiProperty } from '@nestjs/swagger';

export class CurrentSubjectInfo {
  @ApiProperty({ type: 'string', nullable: true })
  subject: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  startTime: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  endTime: string | null;
}
