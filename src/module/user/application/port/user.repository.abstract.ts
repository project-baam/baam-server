import { UserProfileEntity } from '../../adapter/persistence/orm/entities/user-profile.entity';
import { UserEntity } from '../../adapter/persistence/orm/entities/user.entity';

export abstract class UserRepository {
  abstract findOneByProvider(
    provider: string,
    id: string,
  ): Promise<UserEntity | null>;
  abstract findOneById(id: number): Promise<UserEntity | null>;
  abstract findOneByIdOrFail(id: number): Promise<UserEntity>;
  abstract upseretOne(user: Partial<UserEntity>): Promise<void>;
  abstract updateOne(user: Partial<UserEntity> & { id: number }): Promise<void>;
  abstract upsertProfile(user: Partial<UserProfileEntity>): Promise<void>;
  abstract updateProfile(
    userId: number,
    user: Partial<UserProfileEntity>,
  ): Promise<void>;
  abstract deleteOne(id: number): Promise<void>;
}
