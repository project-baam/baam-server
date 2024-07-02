// outbound port
import { User, Prisma } from '@prisma/client';

export abstract class UserRepository {
  abstract findUniqueUserByEmail(email: string): Promise<User | null>;
  abstract saveUniqueUserOrFail(user: Prisma.UserCreateInput): Promise<User>;
  abstract findOneById(id: number): Promise<User | null>;
  abstract findOneByIdOrFail(id: number): Promise<User>;
}
