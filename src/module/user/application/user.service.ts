import { TimetableService } from 'src/module/timetable/application/timetable.service';
import { EnvironmentService } from 'src/config/environment/environment.service';
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
import { ObjectStorageService } from 'src/module/object-storage/application/object-storage.service.abstract';
import { StorageCategory } from 'src/module/object-storage/domain/enums/storage-category.enum';
import { SupportedEnvironment } from 'src/config/environment/environment';
import { MissingRequiredFieldsError } from 'src/common/types/error/application-exceptions';
import { profile } from 'console';

export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly classRepository: ClassRepository,
    private readonly objectStorageService: ObjectStorageService,
    private readonly environmentService: EnvironmentService,
    private readonly timetableService: TimetableService,
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

  async upsertProfileImage(
    userId: number,
    file: Express.Multer.File,
  ): Promise<string> {
    const uploadParams = {
      uniqueKey: userId,
      file,
      category: StorageCategory.USER_PROFILES,
      environment: this.environmentService.get<SupportedEnvironment>('ENV')!,
    };
    const newImgUrl = await this.objectStorageService.uploadFile(uploadParams);

    const user = await this.userRepository.findOneByIdOrFail(userId);
    if (user.profile?.profileImageUrl) {
      await this.objectStorageService.deleteFile({
        objectUrl: user.profile.profileImageUrl,
      });
    }

    return newImgUrl;
  }

  // TODO: Add transaction
  async updateProfile(
    user: UserEntity,
    params: UpdateProfileRequest,
    file: Express.Multer.File,
  ): Promise<User> {
    const { schoolId, grade, className, fullName, isProfilePublic } = params;
    await this.schoolRepository.findByIdOrFail(schoolId);
    const hasPartialData = schoolId || className || grade;
    if (hasPartialData && (!schoolId || !className || !grade)) {
      throw new MissingRequiredFieldsError(['schoolId', 'className', 'grade']);
    }

    let classId: number | undefined;

    if (schoolId && className && grade) {
      classId = (
        await this.classRepository.findByNameAndGradeOrFail(
          schoolId,
          className,
          grade,
        )
      ).id;
    }

    if (classId) {
      this.timetableService.setUserDefaultTimetableWithFallbackFetch(
        user.id,
        classId,
      );
    }

    let profileImageUrl: string | undefined;
    if (file) {
      profileImageUrl = await this.upsertProfileImage(user.id, file);
    }

    await this.userRepository.upsertProfile({
      userId: user.id,
      fullName: fullName ?? user.profile?.fullName,
      classId:
        classId !== null && classId !== undefined
          ? classId
          : user.profile?.classId,
      isProfilePublic:
        isProfilePublic !== undefined
          ? isProfilePublic
          : user.profile?.isProfilePublic,
      profileImageUrl: profileImageUrl ?? user.profile?.profileImageUrl,
    });

    const updatedUser = await this.userRepository.findOneByIdOrFail(user.id);

    // 필수 정보가 모두 입력되었을 때만 유저 상태 변경
    if (
      updatedUser.profile?.classId !== null &&
      updatedUser.profile?.classId != undefined &&
      updatedUser.profile?.fullName
    ) {
      await this.userRepository.updateOne({
        id: user.id,
        status: UserStatus.ACTIVE,
      });
    }

    return UserMapper.toDomain(
      await this.userRepository.findOneByIdOrFail(user.id),
    );
  }

  async delete(userId: number): Promise<void> {
    await this.userRepository.deleteOne(userId);
  }

  async deleteProfileImage(
    params: Pick<User, 'id' | 'profileImageUrl'>,
  ): Promise<User> {
    await this.objectStorageService.deleteFile({
      objectUrl: params.profileImageUrl,
    });
    await this.userRepository.updateProfile(params.id, {
      profileImageUrl: null,
    });

    return UserMapper.toDomain(
      await this.userRepository.findOneByIdOrFail(params.id),
    );
  }
}
