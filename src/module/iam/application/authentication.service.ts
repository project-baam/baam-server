import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { EnvironmentService } from 'src/config/environment/environment.service';
import { FindUniqueUserQuery } from 'src/module/user/application/dto/user.query';
import { RefreshTokenIdsStorage } from '../adapter/persistence/in-memory/refresh-token-ids.storage';
import {
  ContentNotFoundError,
  InvalidAccessTokenError,
  InvalidatedRefreshTokenError,
  MissingAuthTokenError,
} from 'src/common/types/error/application-exceptions';
import { UserService } from '../../user/application/user.service';
import {
  AccessTokenPayload,
  JWT,
  RefreshTokenPayload,
  SignInRequest,
  SignInResponse,
} from '../adapter/presenter/rest/dto/sign-in.dto';
import { RefreshTokenDto } from '../adapter/presenter/rest/dto/refresh-token.dto';
import { SignInProvider } from '../domain/enums/sign-in-provider.enum';
import { KakaoAuth } from '../adapter/external/social/kakao-auth';
import { AuthenticationStrategy } from './port/\bauthentication-strategy.abstract';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import { AppleAuth } from '../adapter/external/social/apple-auth';
import { parseUserAgent } from 'src/module/util/user-agent-parser.service';
import { ReportProvider } from 'src/common/provider/report.provider';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';

@Injectable()
export class AuthenticationService {
  private authStrategies: Map<SignInProvider, AuthenticationStrategy>;

  constructor(
    private kakaoAuth: KakaoAuth,
    private appleAuth: AppleAuth,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {
    this.authStrategies = new Map<SignInProvider, AuthenticationStrategy>([
      [SignInProvider.KAKAO, kakaoAuth],
      [SignInProvider.APPLE, appleAuth],
    ]);
  }

  async validateAccessToken(token?: string): Promise<UserEntity> {
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

    if (!user) {
      throw new InvalidAccessTokenError();
    }

    return user;
  }

  async signInOrSignUp(
    signInDto: SignInRequest,
    ipAddress: string,
    userAgent?: string,
  ): Promise<SignInResponse> {
    const strategy = this.authStrategies.get(signInDto.provider);
    const { id } = await strategy!.authenticate(signInDto.code);

    let user = await this.userService.findUserByProviderId(
      new FindUniqueUserQuery(signInDto.provider, id),
    );
    if (!user) {
      await this.userRepository.insertOne({
        provider: signInDto.provider,
        providerUserId: id,
      });
    }

    user = (await this.userService.findUserByProviderId(
      new FindUniqueUserQuery(signInDto.provider, id),
    ))!;

    const jwts = await this.generateTokens({
      sub: user.id,
      provider: user.provider,
    });

    // 로그인 로그 저장을 비동기적으로 처리
    this.saveLoginLog(
      user,
      userAgent ?? 'userAgent not found',
      ipAddress,
    ).catch((e) => {
      ReportProvider.warn(e, {
        describe: '로그인 로그 저장 실패',
        user,
        userAgent,
        ipAddress,
      });
    });

    return new SignInResponse(user, jwts);
  }

  // TODO: 테스트용 메서드
  async getAccessTokenByUserId(userId: number): Promise<JWT> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new ContentNotFoundError('user', userId);
    }

    return this.generateTokens({ sub: user.id, provider: user.provider });
  }

  private async saveLoginLog(
    user: UserEntity,
    userAgent: string,
    ipAddress: string,
  ) {
    try {
      await this.userRepository.insertLogLogin({
        userId: user.id,
        deviceInfo: parseUserAgent(userAgent),
        ipAddress,
      });
    } catch (e) {
      // 에러를 다시 throw하여 상위의 catch 블록에서 처리할 수 있게 함
      throw e;
    }
  }

  private async generateTokens(payload: AccessTokenPayload): Promise<JWT> {
    const refreshTokenPayload: RefreshTokenPayload = {
      refreshTokenId: randomUUID(),
      sub: payload.sub,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.environmentService.get<number>('JWT_ACCESS_TOKEN_TTL'),
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: this.environmentService.get<number>('JWT_REFRESH_TOKEN_TTL'),
      }),
    ]);
    await this.refreshTokenIdsStorage.insert(
      payload.sub,
      refreshTokenPayload.refreshTokenId,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(
          refreshTokenDto.refreshToken,
        );
      const user = await this.userRepository.findOneByIdOrFail(sub);
      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );

      if (!isValid) {
        throw Error();
      }

      // Refresh Token Rotation
      // 한 번 사용된 refresh token 은 무효화 시키기
      await this.refreshTokenIdsStorage.invalidate(user.id);

      return this.generateTokens({ sub: user.id, provider: user.provider });
    } catch {
      throw new InvalidatedRefreshTokenError();
    }
  }
}
