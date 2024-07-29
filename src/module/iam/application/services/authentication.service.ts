import { Injectable, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SocialStrategy } from "../port/social-strategy.interface";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject('KakaoStrategy') private readonly kakaoStrategy: SocialStrategy,
  ) {}

  async validateOAuthLogin(token: string, provider: string): Promise<any> {
    let user;
    if (provider === 'kakao') user = await this.kakaoStrategy.authenticate(token);

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
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
