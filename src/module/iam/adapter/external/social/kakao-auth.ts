import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { KakaoTokenInfoResponse, KakaoTokenResponse } from './dto/kakao.dto';
import { SocialAuthenticationError } from 'src/common/types/error/application-exceptions';
import { AuthenticationStrategy } from 'src/module/iam/application/port/\bauthentication-strategy.abstract';
import { EnvironmentService } from 'src/config/environment/environment.service';

@Injectable()
export class KakaoAuth implements AuthenticationStrategy {
  constructor(
    private readonly httpService: HttpService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async authenticate(authorizationCode: string): Promise<{ id: string }> {
    // 받은 인가 코드로 토큰 발급 요청
    const requestBody = {
      grant_type: 'authorization_code',
      client_id: this.environmentService.get<string>('KAKAO_CLIENT_ID'),
      redirect_uri: this.environmentService.get<string>('KAKAO_REDIRECT_URI'),
      client_secret: this.environmentService.get<string>('KAKAO_CLIENT_SECRET'),
      code: authorizationCode,
    };

    try {
      const res$ = this.httpService.post<KakaoTokenResponse>(
        'https://kauth.kakao.com/oauth/token',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const { data } = await lastValueFrom(res$);

      const accessToken = data.access_token;

      // 토큰 정보 요청
      const res$$ = this.httpService.get<KakaoTokenInfoResponse>(
        'https://kapi.kakao.com/v1/user/access_token_info',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const kakaoUserId = (await lastValueFrom(res$$)).data.id;

      return { id: String(kakaoUserId) };
    } catch (err: any) {
      throw new SocialAuthenticationError(
        SignInProvider.KAKAO,
        JSON.stringify(err.response.data),
      );
    }
  }

  getProvider(): SignInProvider {
    return SignInProvider.KAKAO;
  }
}
