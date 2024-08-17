import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { EnvironmentService } from 'src/config/environment/environment.service';
import { HashingService } from '../util/hashing/hashing.service.abstract';
import { SignUpDto, SignUpResonse } from './dto/sign-up.dto';
import {
  ActiveUserData,
  JWT,
  RefreshTokenPayload,
  SignInDto,
  SignInResponse,
} from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserCommand } from 'src/module/user/application/dto/user.command';
import { FindUniqueUserQuery } from 'src/module/user/application/dto/user.query';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import {
  IncorrectLoginInfo,
  InvalidatedRefreshTokenError,
} from 'src/common/types/error/application-exceptions';
import { UserService } from '../user/application/user.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<SignUpResonse> {
    const { email, password, grade } = signUpDto;
    const hashedPassword = await this.hashingService.hash(password);

    const user = await this.userService.createUser(
      new CreateUserCommand(email, hashedPassword, grade),
    );

    return new SignUpResonse(user);
  }

  async signIn(signInDto: SignInDto): Promise<SignInResponse> {
    const user = await this.userService.findUnqiueUser(
      new FindUniqueUserQuery(signInDto.email),
    );
    if (!user) {
      throw new IncorrectLoginInfo();
    }
    const isCorrectPassword = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );
    if (!isCorrectPassword) {
      throw new IncorrectLoginInfo();
    }

    const jwts = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    return new SignInResponse(user, jwts);
  }

  private async generateTokens(payload: ActiveUserData): Promise<JWT> {
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
      const user = await this.userService.findOneByIdOrFail(sub);
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

      return this.generateTokens({ sub: user.id, email: user.email });
    } catch {
      throw new InvalidatedRefreshTokenError();
    }
  }
}
