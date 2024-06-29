import { UserGrade } from 'src/module/user/domain/value-objects/user-grade';

export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly grade: UserGrade,
  ) {}
}
