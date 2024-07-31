import { Injectable } from '@nestjs/common';
import { UserRepository } from '../port/user.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }

  async createUser(user: Partial<User>): Promise<User> {
    const newUser = new User(
      user.id,
      user.email,
      user.username,
      user.thirdPartyId,
      user.provider,
    );
    await this.userRepository.save(newUser);
    return newUser;
  }

  async saveUser(user: User): Promise<void> {
    return this.userRepository.save(user);
  }
}