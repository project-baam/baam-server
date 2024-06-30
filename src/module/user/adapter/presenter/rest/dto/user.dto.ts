import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserGrade } from 'src/module/user/domain/value-objects/user-grade';

import { UserEntity } from '../../../persistence/orm/entities/user.entity';

export class GetUserResponse {
  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  grade: UserGrade;

  @ApiProperty()
  @Expose()
  signedUpAt: Date;

  constructor(entity: UserEntity) {
    this.email = entity.email;
    this.grade = entity.grade;
    this.signedUpAt = entity.signedUpAt;
  }
}
