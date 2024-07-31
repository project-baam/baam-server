import { SocialStrategy } from "../../application/port/social-strategy.interface";
import axios from 'axios';

export class KakaoStrategy implements SocialStrategy {
  async authenticate(token: string): Promise<any> {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const profile = response.data;
    return {
      provider: 'kakao',
      providerId: profile.id,
      email: profile.kakao_account.email,
      username: profile.properties.nickname,
    };
  }
}