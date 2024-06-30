import { IsEmail, IsEnum, MinLength } from 'class-validator';
import { UserGrade } from 'src/module/user/domain/value-objects/user-grade';
import { PASSWORD_MIN_LENGTH } from '../constants/authentication';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
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
  signedUpAt: Date;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.email = user.email;
    this.grade = user.grade;
    this.signedUpAt = user.signedUpAt;
  }
}
