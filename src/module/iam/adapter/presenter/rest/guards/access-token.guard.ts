import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { REQUEST_USER_KEY } from '../../../../domain/constants/authentication';
import {
  IncompleteProfileError,
  InvalidAccessTokenError,
  MissingAuthTokenError,
} from 'src/common/types/error/application-exceptions';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import { UserStatus } from 'src/module/user/domain/enum/user-status.enum';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new MissingAuthTokenError();
    }

    let userId: number;
    try {
      const payload = await this.jwtService.verifyAsync(token);
      userId = payload.sub;
    } catch (err) {
      throw new InvalidAccessTokenError();
    }

    const user = await this.userRepository.findOneById(userId);
    request[REQUEST_USER_KEY] = user;

    if (!user) {
      throw new InvalidAccessTokenError();
    }

    // 프로필 업데이트 API는 INCOMPLETE_PROFILE도 접근 가능(회원가입시 사용)
    const allowedApis = [
      { path: '/user', method: 'PATCH' },
      {
        path: '/device-token',
        method: 'POST',
      },
    ];
    const isAllowed = allowedApis.some(
      (api) => api.path === request.path && api.method === request.method,
    );

    if (isAllowed) {
      return true;
    }

    if (user?.status === UserStatus.INCOMPLETE_PROFILE) {
      throw new IncompleteProfileError();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
