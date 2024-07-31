import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SocialStrategy } from '../port/social-strategy.interface';
import { UserService } from '../../../user/application/services/user.service';
import { RefreshTokenIdsStorage } from '../../adapter/persistence/refresh-token-ids.storage';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject('KakaoStrategy') private readonly kakaoStrategy: SocialStrategy,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async validateOAuthLogin(token: string, provider: string): Promise<any> {
    let user;
    if (provider === 'kakao')
      user = await this.kakaoStrategy.authenticate(token);

    if (user) {
      const existingUser = await this.userService.findUserByEmail(user.email);
      if (!existingUser) {
        return await this.userService.createUser(user);
      }
      return existingUser;
    }
    throw new Error('Invalid provider or token');
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    this.refreshTokenIdsStorage.add(refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!this.refreshTokenIdsStorage.contains(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
