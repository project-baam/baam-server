// inbound port

import { FindUniqueUserQuery } from './dto/user.query';
import { UserRepository } from './port/user.repository.abstract';
import { Inject } from '@nestjs/common';
import { UserEntity } from '../adapter/persistence/orm/entities/user.entity';
import { UserMapper } from '../adapter/presenter/rest/mappers/user.mapper';
import { User } from './../domain/user';
import { UpdateProfileRequest } from '../adapter/presenter/rest/dto/user.dto';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository.abstract';
import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository.abstract';
import { UserStatus } from '../domain/enum/user-status.enum';

export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly classRepository: ClassRepository,
  ) {}

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

  // TODO: Add transaction
  async updateProfile(
    userId: number,
    params: UpdateProfileRequest,
  ): Promise<User> {
    const {
      schoolId,
      grade,
      className,
      fullName,
      profileImageUrl,
      isProfilePublic,
    } = params;
    await this.schoolRepository.findByIdOrFail(schoolId);
    const classId = (
      await this.classRepository.findByNameAndGradeOrFail(
        schoolId,
        className,
        grade,
      )
    ).id;

    await this.userRepository.upsertProfile({
      userId,
      fullName,
      classId,
      profileImageUrl,
      isProfilePublic,
    });

    const updatedUser = await this.userRepository.findOneByIdOrFail(userId);

    // 필수 정보가 모두 입력되었을 때만 유저 상태 변경
    if (
      updatedUser.profile?.classId !== null &&
      updatedUser.profile?.classId != undefined &&
      updatedUser.profile?.fullName
    ) {
      await this.userRepository.updateOne({
        ...updatedUser,
        status: UserStatus.ACTIVE,
      });
    }

    return UserMapper.toDomain(
      await this.userRepository.findOneByIdOrFail(userId),
    );
  }

  async delete(userId: number): Promise<void> {
    await this.userRepository.deleteOne(userId);
  }
}
