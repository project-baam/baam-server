import { SocialAuthenticationError } from 'src/common/types/error/application-exceptions';
import { EnvironmentService } from 'src/config/environment/environment.service';
import { AuthenticationStrategy } from 'src/module/iam/application/port/\bauthentication-strategy.abstract';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import jwkToBuffer from 'jwk-to-pem';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppleAuth implements AuthenticationStrategy {
  constructor(private readonly environmentService: EnvironmentService) {}

  private async fetchApplePublicKeys(): Promise<any> {
    const response = await axios.get('https://appleid.apple.com/auth/keys');
    return response.data.keys;
  }

  async authenticate(idToken: string): Promise<{ id: string }> {
    const publicKeys = await this.fetchApplePublicKeys();

    const decodedToken: any = jwt.decode(idToken, { complete: true });

    if (!decodedToken) {
      throw new SocialAuthenticationError(
        SignInProvider.APPLE,
        'Invalid ID token',
      );
    }

    const kid = decodedToken.header.kid;
    const publicKey = publicKeys.find((key: any) => key.kid === kid);

    if (!publicKey) {
      throw new SocialAuthenticationError(
        SignInProvider.APPLE,
        'Invalid token key(public key not found)',
      );
    }

    try {
      const pem = jwkToBuffer(publicKey);

      const verified: any = jwt.verify(idToken, pem, {
        algorithms: ['RS256'],
      });

      if (verified.iss !== 'https://appleid.apple.com') {
        throw new Error('Invalid issuer');
      }

      if (
        verified.aud !== this.environmentService.get<string>('APPLE_BUNDLE_ID')
      ) {
        throw new Error('Invalid audience');
      }

      if (verified.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }

      return { id: verified.sub };
    } catch (error: any) {
      Logger.error(error);
      throw new SocialAuthenticationError(
        SignInProvider.APPLE,
        'Token verification failed: ' + error.message,
      );
    }
  }

  getProvider(): SignInProvider {
    return SignInProvider.APPLE;
  }
}
