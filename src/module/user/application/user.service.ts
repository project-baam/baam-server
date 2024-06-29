// inbound port

import { FindUniqueUserQuery } from './dto/user.query';
import { CreateUserCommand } from './dto/user.command';
import { UserRepository } from './port/user.repository';
import { Inject } from '@nestjs/common';
import { UserEntity } from '../adapter/persistence/orm/entities/user.entity';

export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserCommand): Promise<UserEntity> {
    return await this.userRepository.saveUniqueUserOrFail(createUserDto);
  }

  async findUnqiueUser(
    findUniqueUserDto: FindUniqueUserQuery,
  ): Promise<UserEntity | null> {
    return await this.userRepository.findUniqueUserByEmail(
      findUniqueUserDto.email,
    );
  }

  async findOneByIdOrFail(id: number): Promise<UserEntity> {
    return await this.userRepository.findOneByIdOrFail(id);
  }
}
