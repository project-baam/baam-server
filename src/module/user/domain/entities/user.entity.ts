export class User {
  constructor(
    public id: string | undefined,
    public email: string | undefined,
    public username: string | undefined,
    public thirdPartyId?: string | undefined,
    public provider?: string | undefined
  ) {}
}
