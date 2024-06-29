import { Expose, plainToInstance } from 'class-transformer';
import { User } from 'src/module/user/domain/user';
import { UserGrade } from 'src/module/user/domain/value-objects/user-grade';

export class GetUserResponse {
  @Expose()
  email: string;

  @Expose()
  grade: UserGrade;

  @Expose()
  signedUpAt: Date;

  static toDto(domain: User) {
    return plainToInstance(this, domain, { excludeExtraneousValues: true });
  }
}
