import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserGrade } from 'src/module/user/domain/value-objects/user-grade';

export class GetUserResponse {
  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  grade: UserGrade;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
