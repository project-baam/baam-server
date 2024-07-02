import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/module/database/orm/prisma.service';
import { User, Prisma } from '@prisma/client';
import { PostgresqlErrorCodes } from 'src/common/constants/postgresql-error-codes';
import { UserRepository } from 'src/module/user/application/port/user.repository';
import {
  ContentNotFoundError,
  DuplicateValueError,
} from 'src/common/types/error/application-exceptions';

@Injectable()
export class OrmUserRepository implements UserRepository {
  constructor(private readonly userRepository: PrismaService) {}

  async findOneById(id: number): Promise<User | null> {
    const user = await this.userRepository.user.findUnique({ where: { id } });

    return user;
  }

  async findOneByIdOrFail(id: number): Promise<User> {
    const user = await this.userRepository.user.findUnique({ where: { id } });
    if (!user) {
      throw new ContentNotFoundError('user', id);
    }

    return user;
  }
  async findUniqueUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.user.findUnique({ where: { email } });
  }

  async saveUniqueUserOrFail(user: Prisma.UserCreateInput): Promise<User> {
    try {
      const newEntity = await this.userRepository.user.create({ data: user });

      return newEntity;
    } catch (err: any) {
      if (err?.code === PostgresqlErrorCodes.UniqueViolation) {
        throw new DuplicateValueError('User', 'email', user.email);
      }

      throw err;
    }
  }
}
