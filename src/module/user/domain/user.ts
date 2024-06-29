import { ApiProperty } from '@nestjs/swagger';
import { UserGrade } from './value-objects/user-grade';
import { Exclude, Expose } from 'class-transformer';

export class User {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string; // unique

  @ApiProperty()
  @Exclude()
  password: string;

  @ApiProperty({ type: 'enum', enum: UserGrade })
  @Expose()
  grade: UserGrade;

  @ApiProperty()
  signedUpAt: Date;
}
