import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { LogDeletedUserEntity } from '../entities/log-deleted-user.entity';
import { LogLoginEntity } from '../entities/log-login.entity';

@Injectable()
export class OrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserProfileEntity)
    private readonly profileRepository: Repository<UserProfileEntity>,

    @InjectRepository(LogDeletedUserEntity)
    private readonly logDeletedUserRepository: Repository<LogDeletedUserEntity>,

    @InjectRepository(LogLoginEntity)
    private readonly logLoginRepository: Repository<LogLoginEntity>,
  ) {}

  async insertLogLogin(
    dto: Pick<LogLoginEntity, 'userId' | 'ipAddress' | 'deviceInfo'>,
  ): Promise<void> {
    await this.logLoginRepository.insert(dto);
  }

  async updateProfile(
    userId: number,
    user: Partial<UserProfileEntity>,
  ): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new ContentNotFoundError('profile', userId);
    }

    Object.assign(profile, user);

    // update 말고 save 사용해야 @BeforeUpdate가 트리거됨
    await this.profileRepository.save(profile);
  }

  async updateOne(user: Partial<UserEntity> & { id: number }): Promise<void> {
    await this.userRepository.update(user.id, user);
  }

  async findOneByProvider(
    provider: SignInProvider,
    providerUserId: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      relations: {
        profile: {
          class: {
            school: true,
          },
        },
      },
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
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.class', 'class')
      .leftJoinAndSelect('class.school', 'school')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new ContentNotFoundError('user', id);
    }

    return user;
  }

  async insertOne(user: Partial<UserEntity>): Promise<void> {
    await this.userRepository.save(this.userRepository.create(user));
  }

  async upsertProfile(profile: UserProfileEntity): Promise<void> {
    await this.profileRepository.save(this.profileRepository.create(profile));
  }

  async deleteOne(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async insertLogDeletedUser(user: Partial<UserEntity>): Promise<void> {
    await this.logDeletedUserRepository.insert({
      userId: user.id,
      provider: user.provider,
      providerUserId: user.providerUserId,
      deletedAt: new Date(),
      status: user.status,
      fullName: user.profile?.fullName,
      classId: user.profile?.classId,
    });
  }
}
