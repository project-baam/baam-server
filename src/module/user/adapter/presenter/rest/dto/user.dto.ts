import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { UserStatus } from 'src/module/user/domain/enum/user-status.enum';
import { IsOptionalKoreanEnglishMaxLength } from '../decorators/is-optional-korean-english-max-length.validator';

export class GetUserResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({ enum: UserStatus, type: 'enum' })
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
  @Type(() => Number)
  schoolId: number;

  @ApiProperty({ enum: UserGrade, type: 'enum' })
  @Expose()
  @IsEnum(UserGrade)
  @Type(() => Number)
  @IsOptional()
  grade: UserGrade;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsOptional()
  className: string;

  @ApiProperty()
  @Expose()
  @IsOptionalKoreanEnglishMaxLength()
  fullName: string;

  @ApiProperty()
  @Expose()
  @IsBooleanString()
  @IsOptional()
  isClassPublic: boolean;

  @ApiProperty()
  @Expose()
  @IsBooleanString()
  @IsOptional()
  isTimetablePublic: boolean;
}
// UpdateProfileRequest 랑 동일
export const updateProfileProperty = {
  schoolId: { type: 'number', required: false },
  grade: {
    type: 'enum',
    enum: Object.values(UserGrade).filter((e) => typeof e === 'number'),
    required: false,
  },
  className: { type: 'string', required: false },
  fullName: { type: 'string', required: false },
  isClassPublic: { type: 'boolean', required: false },
  isTimetablePublic: { type: 'boolean', required: false },
};
