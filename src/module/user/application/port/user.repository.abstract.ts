import { UserEntity } from '../../adapter/persistence/orm/entities/user.entity';

export abstract class UserRepository {
  abstract findOneByProvider(
    provider: string,
    id: string,
  ): Promise<UserEntity | null>;
  abstract findOneById(id: number): Promise<UserEntity | null>;
  abstract findOneByIdOrFail(id: number): Promise<UserEntity>;
  abstract saveUniqueUserOrFail(user: Partial<UserEntity>): Promise<UserEntity>;
}
