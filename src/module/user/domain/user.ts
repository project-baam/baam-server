import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserStatus } from './enum/user-status.enum';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';

export class User {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({ enum: UserStatus, type: 'enum' })
  @Expose()
  status: UserStatus;

  @ApiProperty()
  @Expose()
  provider: SignInProvider;

  // Neis Open API 특성 고려 우리 서비스 DB의 schoolId 를 함꼐 가지고 있는게 편리함
  @ApiProperty()
  @Expose()
  schoolId: number;

  @ApiProperty()
  @Expose()
  schoolName: number;

  @ApiProperty({ enum: UserGrade, type: 'enum' })
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
  backgroundImageUrl: string;

  @ApiProperty()
  @Expose()
  isClassPublic: boolean;

  @ApiProperty()
  @Expose()
  isTimetablePublic: boolean;
}
