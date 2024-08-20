import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { RestApi } from 'src/common/decorator/rest-api.decorator';
import { UserService } from 'src/module/user/application/user.service';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { User } from 'src/module/user/domain/user';
import { UserEntity } from '../../persistence/orm/entities/user.entity';
import { UserMapper } from './mappers/user.mapper';
import { updateProfileProperty, UpdateProfileRequest } from './dto/user.dto';
import { ApiBooleanResponse } from 'src/docs/decorator/api-boolean-response';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiFiles } from 'src/docs/decorator/api-files-request';
import { profileImageMulterOptions } from 'src/module/user/domain/config/profile-image-multer-options';
import {
  ContentNotFoundError,
  InvalidFileNameCharatersError,
  InvalidFileNameExtensionError,
  MissingRequiredFieldsError,
} from 'src/common/types/error/application-exceptions';
import { ErrorCode } from 'src/common/constants/error-codes';
import { ApiResponse } from '@nestjs/swagger';
import {
  MAX_PROFILE_IMAGES,
  PROFILE_IMAGE_FIELDS,
} from './constants/profile-image.constants';

@RestApi('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiDescription({
    tags: ['User'],
    summary: '로그인한 유저 프로필 조회',
    auth: AuthorizationToken.BearerUserToken,
    dataResponse: {
      status: HttpStatus.OK,
      schema: User,
    },
  })
  @Get()
  async getUser(@ActiveUser() user: UserEntity): Promise<User> {
    return UserMapper.toDomain(user);
  }

  @ApiDescription({
    tags: ['User'],
    summary: '유저 정보 업데이트',
    description: `모든 필드 optional,\n
    학교 정보 변경시 schoolId(학교), className(학급), grade(학년)\n
    모두 포함, 하나라도 미포함시 ${ErrorCode.MissingRequiredFields}\n\
    존재하지 않는 학교나 학급의 경우 ${ErrorCode.ContentNotFound}`,
    auth: AuthorizationToken.BearerUserToken,
    dataResponse: {
      status: HttpStatus.OK,
      schema: User,
    },
    exceptions: [
      InvalidFileNameCharatersError,
      InvalidFileNameExtensionError,
      MissingRequiredFieldsError,
      ContentNotFoundError,
    ],
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: PROFILE_IMAGE_FIELDS.PROFILE, maxCount: 1 },
        { name: PROFILE_IMAGE_FIELDS.BACKGROUND, maxCount: 1 },
      ],
      profileImageMulterOptions,
    ),
  )
  @ApiFiles(
    [
      { name: PROFILE_IMAGE_FIELDS.PROFILE, required: false },
      { name: PROFILE_IMAGE_FIELDS.BACKGROUND, required: false },
    ],
    updateProfileProperty,
  )
  @Patch()
  async updateProfile(
    @ActiveUser() user: UserEntity,
    @Body() params: UpdateProfileRequest,
    @UploadedFiles()
    files: {
      [PROFILE_IMAGE_FIELDS.PROFILE]?: Express.Multer.File[];
      [PROFILE_IMAGE_FIELDS.BACKGROUND]?: Express.Multer.File[];
    },
  ) {
    return this.userService.updateProfile(user, params, files);
  }

  @ApiDescription({
    tags: ['User'],
    summary: '유저 프로필 이미지 삭제',
    auth: AuthorizationToken.BearerUserToken,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '프로필 배경 이미지가 성공적으로 삭제됨',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('profile/image')
  async deleteUserProfileImage(@ActiveUser() user: UserEntity) {
    if (!user.profile?.profileImageUrl) {
      return user;
    }

    await this.userService.deleteProfileImage({
      id: user.id,
      profileImageUrl: user.profile!.profileImageUrl!,
    });
  }

  @ApiDescription({
    tags: ['User'],
    summary: '유저 프로필 이미지 삭제',
    auth: AuthorizationToken.BearerUserToken,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('profile/background-image')
  @ApiResponse({
    status: 204,
    description: '프로필 배경 이미지가 성공적으로 삭제됨',
  })
  async deleteProfileBackgroundImage(@ActiveUser() user: UserEntity) {
    if (!user.profile?.backgroundImageUrl) {
      return user;
    }

    await this.userService.deleteProfileBackgroundImage({
      id: user.id,
      backgroundImageUrl: user.profile!.backgroundImageUrl!,
    });
  }

  // TODO: 기획 확인 필요
  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['User'],
    summary: '탈퇴',
    auth: AuthorizationToken.BearerUserToken,
  })
  @Delete()
  async deleteUser(@ActiveUser() user: UserEntity) {
    await this.userService.delete(user.id);

    return true;
  }
}
