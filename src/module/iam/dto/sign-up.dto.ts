import { IsEmail, IsEnum, MinLength } from 'class-validator';
import { UserGrade } from 'src/module/user/domain/value-objects/user-grade';
import { PASSWORD_MIN_LENGTH } from '../constants/authentication';
import { User } from 'src/module/user/domain/user';
import { ApiProperty, OmitType } from '@nestjs/swagger';

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

export class SignUpResonse extends OmitType(User, ['password']) {}
