import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { User } from 'src/module/user/domain/user';
import { PostgresqlErrorCodes } from 'src/common/constants/postgresql-error-codes';
import { UserRepository } from 'src/module/user/application/port/user.repository';
import {
  ContentNotFoundError,
  DuplicateValueError,
} from 'src/common/types/error/application-exceptions';

@Injectable()
export class OrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOneById(id: number): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ id });

    return user;
  }

  async findOneByIdOrFail(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new ContentNotFoundError('user', id);
    }

    return user;
  }
  async findUniqueUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy({ email });
  }

  async saveUniqueUserOrFail(user: Partial<User>): Promise<UserEntity> {
    try {
      const newEntity = await this.userRepository.save(user);

      return newEntity;
    } catch (err) {
      if (err.code === PostgresqlErrorCodes.UniqueViolation) {
        throw new DuplicateValueError('User', 'email', user.email);
      }

      throw err;
    }
  }
}
