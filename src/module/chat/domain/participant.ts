import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';

export class Participant {
  @ApiProperty()
  @Expose()
  userId: number;

  @ApiProperty({ type: 'enum', enum: UserGrade })
  @Expose()
  grade: UserGrade;

  @ApiProperty()
  @Expose()
  fullName: string;

  @ApiProperty()
  @Expose()
  profileImage: string;

  @ApiProperty()
  @Expose()
  className: string;

  @ApiProperty({ nullable: true, type: 'string' })
  @Expose()
  activeClassNow: string | null; // 시간표를 등록한 친구만 해당

  @ApiProperty()
  @Expose()
  initial: string;
}
