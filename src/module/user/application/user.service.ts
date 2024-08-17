// inbound port

import { FindUniqueUserQuery } from './dto/user.query';
import { CreateUserCommand } from './dto/user.command';
import { UserRepository } from './port/user.repository.abstract';
import { Inject } from '@nestjs/common';
import { UserEntity } from '../adapter/persistence/orm/entities/user.entity';
import { UserMapper } from '../adapter/presenter/rest/mappers/user.mapper';
import { User } from './../domain/user';

export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserCommand): Promise<UserEntity> {
    return await this.userRepository.saveUniqueUserOrFail(createUserDto);
  }

  async findUserByProviderId(
    findUniqueUserDto: FindUniqueUserQuery,
  ): Promise<UserEntity | null> {
    return await this.userRepository.findOneByProvider(
      findUniqueUserDto.provider,
      findUniqueUserDto.providerUserId,
    );
  }

  async getUserProfile(userId: number): Promise<User> {
    return UserMapper.toDomain(
      await this.userRepository.findOneByIdOrFail(userId),
    );
  }
}
