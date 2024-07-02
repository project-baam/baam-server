import { IsEmail, IsEnum, MinLength } from 'class-validator';
import { UserGrade } from 'src/module/user/domain/value-objects/user-grade';
import { PASSWORD_MIN_LENGTH } from '../constants/authentication';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(PASSWORD_MIN_LENGTH)
  password: string;

  @ApiProperty({ type: 'enum', enum: UserGrade })
  @IsEnum(UserGrade)
  grade: UserGrade;
}

export class SignUpResonse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string; // unique

  @ApiProperty({ type: 'enum', enum: UserGrade })
  @Expose()
  grade: UserGrade;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.grade = user.grade;
    this.createdAt = user.createdAt;
  }
}
