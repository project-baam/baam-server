import { ApiProperty } from '@nestjs/swagger';
import { UserGrade } from './value-objects/user-grade';
import { Expose } from 'class-transformer';

export class User {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string; // unique

  @ApiProperty()
  password: string;

  @ApiProperty({ type: 'enum', enum: UserGrade })
  @Expose()
  grade: UserGrade;

  @ApiProperty()
  @Expose()
  signedUpAt: Date;
}
