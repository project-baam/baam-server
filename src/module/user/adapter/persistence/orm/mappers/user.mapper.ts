import { User } from 'src/module/user/domain/user';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  // entity to domain model
  static toDomain(userEntity: UserEntity): User {
    const userModel = new User(
      userEntity.id,
      userEntity.email,
      userEntity.password,
      userEntity.grade,
      userEntity.signedUpAt,
    );
    return userModel;
  }

  // domain model to entity
  // static toPersistence(user: User) {
  // }
}
