import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { UserStatus } from 'src/module/user/domain/enum/user-status.enum';

export class GetUserResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  status: UserStatus;

  @ApiProperty()
  @Expose()
  provider: SignInProvider;
}

export class UpdateProfileRequest {
  @ApiProperty()
  @Expose()
  @IsNumber()
  @IsOptional()
  schoolId: number;

  @ApiProperty()
  @Expose()
  @IsEnum(UserGrade)
  @IsOptional()
  grade: UserGrade;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsOptional()
  className: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsOptional()
  @IsOptional()
  profileImageUrl: string;

  @ApiProperty()
  @Expose()
  @IsBoolean()
  @IsOptional()
  isProfilePublic: boolean;
}
