import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';

export class CreateUserCommand {
  constructor(
    public readonly provider: SignInProvider,
    public readonly providerUserId: string,
  ) {}
}
