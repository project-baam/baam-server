import { LogLoginEntity } from '../../adapter/persistence/orm/entities/log-login.entity';
import { UserProfileEntity } from '../../adapter/persistence/orm/entities/user-profile.entity';
import { UserEntity } from '../../adapter/persistence/orm/entities/user.entity';

export abstract class UserRepository {
  abstract findOneByProvider(
    provider: string,
    id: string,
  ): Promise<UserEntity | null>;
  abstract findOneById(id: number): Promise<UserEntity | null>;
  abstract findOneByIdOrFail(id: number): Promise<UserEntity>;
  abstract insertOne(user: Partial<UserEntity>): Promise<void>;
  abstract updateOne(user: Partial<UserEntity> & { id: number }): Promise<void>;
  abstract upsertProfile(user: Partial<UserProfileEntity>): Promise<void>;
  abstract updateProfile(
    userId: number,
    user: Partial<UserProfileEntity>,
  ): Promise<void>;
  abstract deleteOne(id: number): Promise<void>;
  abstract insertLogDeletedUser(user: Partial<UserEntity>): Promise<void>;
  abstract insertLogLogin(
    dto: Pick<LogLoginEntity, 'userId' | 'ipAddress' | 'deviceInfo'>,
  ): Promise<void>;
}
