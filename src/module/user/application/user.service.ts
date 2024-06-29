// inbound port

import { FindUniqueUserQuery } from './dto/user.query';
import { CreateUserCommand } from './dto/user.command';
import { UserRepository } from './port/user.repository';
import { Inject } from '@nestjs/common';
import { User } from '../domain/user';
import { UserMapper } from '../adapter/persistence/orm/mappers/user.mapper';

export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserCommand): Promise<User> {
    const user = await this.userRepository.saveUniqueUserOrFail(createUserDto);

    return UserMapper.toDomain(user);
  }

  async findUnqiueUser(findUniqueUserDto: FindUniqueUserQuery): Promise<User> {
    const user = await this.userRepository.findUniqueUserByEmail(
      findUniqueUserDto.email,
    );

    return user ? UserMapper.toDomain(user) : null;
  }

  async findOneByIdOrFail(id: number): Promise<User> {
    const user = await this.userRepository.findOneByIdOrFail(id);

    return UserMapper.toDomain(user);
  }
}
