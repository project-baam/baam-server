import { plainToInstance } from 'class-transformer';

import { User } from 'src/module/user/domain/user';
import { UserEntity } from '../../../persistence/orm/entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return plainToInstance(
      User,
      {
        ...entity,
        ...entity.profile,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
