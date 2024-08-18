import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserStatus } from './enum/user-status.enum';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';

export class User {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  status: UserStatus;

  @ApiProperty()
  @Expose()
  provider: SignInProvider;

  @ApiProperty()
  @Expose()
  schoolName: number;

  @ApiProperty()
  @Expose()
  grade: UserGrade;

  @ApiProperty()
  @Expose()
  className: string;

  @ApiProperty()
  @Expose()
  fullName: string;

  @ApiProperty()
  @Expose()
  profileImageUrl: string;

  @ApiProperty()
  @Expose()
  isProfilePublic: boolean;
}
