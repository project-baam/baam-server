export class User {
  constructor(
    public id: string,
    public email: string,
    public username: string,
    public thirdPartyId?: string,
    public provider?: string,
  ) {}
}
