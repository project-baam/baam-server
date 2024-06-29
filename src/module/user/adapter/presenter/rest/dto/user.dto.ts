import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { UserGrade } from 'src/module/user/domain/value-objects/user-grade';

export class GetUserResponse {
  @ApiProperty()
  @Expose()
  email: string;

  @Expose()
  grade: UserGrade;

  @Expose()
  signedUpAt: Date;

  // mapper
  static toDto(entity: GetUserResponse) {
    return plainToInstance(this, entity, { excludeExtraneousValues: true });
  }
}
