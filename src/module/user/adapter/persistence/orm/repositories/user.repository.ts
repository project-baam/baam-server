import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { PostgresqlErrorCodes } from 'src/common/constants/postgresql-error-codes';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import {
  ContentNotFoundError,
  DuplicateValueError,
} from 'src/common/types/error/application-exceptions';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';

@Injectable()
export class OrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOneByProvider(
    provider: SignInProvider,
    providerUserId: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        provider,
        providerUserId,
      },
    });
  }

  findOneById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        profile: true,
      },
    });
  }

  async findOneByIdOrFail(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        profile: true,
      },
    });
    if (!user) {
      throw new ContentNotFoundError('user', id);
    }

    return user;
  }

  async saveUniqueUserOrFail(
    user: Partial<UserEntity> & { email: string },
  ): Promise<UserEntity> {
    try {
      const newEntity = await this.userRepository.save(user);

      return newEntity;
    } catch (err: any) {
      if (err?.code === PostgresqlErrorCodes.UniqueViolation) {
        throw new DuplicateValueError('User', 'email', user.email);
      }

      throw err;
    }
  }
}
