import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { UserProfileEntity } from '../entities/user-profile.entity';

@Injectable()
export class OrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserProfileEntity)
    private readonly profileRepository: Repository<UserProfileEntity>,
  ) {}

  async updateProfile(
    userId: number,
    user: Partial<UserProfileEntity>,
  ): Promise<void> {
    await this.profileRepository.update(userId, user);
  }

  async updateOne(user: Partial<UserEntity> & { id: number }): Promise<void> {
    await this.userRepository.update(user.id, user);
  }

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
      relations: {
        profile: {
          class: {
            school: true,
          },
        },
      },
      where: {
        id,
      },
    });
  }

  async findOneByIdOrFail(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        profile: {
          class: {
            school: true,
          },
        },
      },
    });
    if (!user) {
      throw new ContentNotFoundError('user', id);
    }

    return user;
  }

  async upseretOne(user: Partial<UserEntity>): Promise<void> {
    await this.userRepository.upsert(user, ['provider', 'providerUserId']);
  }

  async upsertProfile(profile: UserProfileEntity): Promise<void> {
    await this.profileRepository.upsert(profile, ['userId']);
  }

  async deleteOne(id: number): Promise<void> {
    await this.profileRepository.delete(id);
  }
}
