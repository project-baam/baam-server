import { User } from '../../domain/entities/user.entity';

export interface UserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  save(user: User): Promise<void>;
}
