import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/request.dto';
import { Friend, Schoolmate } from 'src/module/friend/domain/friend';
import { IsValidInitial } from '../decorator/initial-validator';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';

export class FriendsResponse {
  @ApiProperty({ type: Friend, isArray: true, description: '즐겨찾기 친구' })
  favaorites: Friend[];

  @ApiProperty({ type: Friend, isArray: true, description: '전체 친구' })
  all: Friend[];

  @ApiProperty({ type: Number, description: '전체 친구 수' })
  total: number;

  @ApiProperty({
    type: 'object',
    description: '초성별 친구 수',
    example: {
      ㄱ: 3,
      B: 5,
    },
  })
  initialCounts: Record<string, number>;

  constructor(
    list: Friend[],
    total: number,
    initialCounts: Record<string, number>,
  ) {
    this.all = list;
    this.favaorites = list.filter((friend) => friend.isFavorite);
    this.initialCounts = initialCounts;
    this.total = total;
  }
}

export class GetFriendsRequest extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Expose()
  name?: string;

  @ApiProperty({
    required: false,
    description: '초성, 영어는 대문자만 허용',
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsValidInitial({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  initials?: string[];
}

export class GetFavoriteFriendsRequest extends PaginationDto {}

export class GetFriendRequestRequest extends PaginationDto {}

export class AcceptOrRejectFriendRequestRequest {
  @ApiProperty()
  @IsBoolean()
  accept: boolean;
}

export class GetSchoolmatesRequest extends PaginationDto {
  @ApiProperty({
    required: false,
    description: '학년',
    enum: UserGrade,
    type: 'enum',
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(Number);
    }
    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  })
  @IsArray()
  @Min(1, { each: true })
  @Max(3, { each: true })
  grades?: UserGrade[];

  @ApiProperty({ required: false, description: '이름' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: '즐겨찾기' })
  @IsOptional()
  @IsBooleanString()
  isFavorite: boolean;

  @ApiProperty({
    required: false,
    description: '초성, 영어는 대문자만 허용',
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsValidInitial({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  initials?: string[];
}

export class SchoolmatesResponse {
  @ApiProperty({ type: Schoolmate, isArray: true })
  list: Schoolmate[];

  @ApiProperty({ type: Number, description: '전체 유저 수' })
  total: number;

  @ApiProperty({
    type: 'object',
    description: '초성별 유저 수',
    example: {
      ㄱ: 3,
      B: 5,
    },
  })
  initialCounts: Record<string, number>;
}
