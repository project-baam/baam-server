// outbound port
import { UserEntity } from '../../adapter/persistence/orm/entities/user.entity';

export abstract class UserRepository {
  abstract findUniqueUserByEmail(email: string): Promise<UserEntity>;
  abstract saveUniqueUserOrFail(user: Partial<UserEntity>): Promise<UserEntity>;
  abstract findOneById(id: number): Promise<UserEntity | null>;
  abstract findOneByIdOrFail(id: number): Promise<UserEntity>;
}
