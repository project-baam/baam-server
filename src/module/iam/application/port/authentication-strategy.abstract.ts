import { SignInProvider } from '../../domain/enums/sign-in-provider.enum';

export abstract class AuthenticationStrategy {
  abstract authenticate(credentials: any): Promise<{ id: string }>;
  abstract getProvider(): SignInProvider;
}
