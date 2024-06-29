import { UserGrade } from './value-objects/user-grade';

export class User {
  constructor(
    public id: number,
    public email: string, // unique
    public password: string,
    public grade: UserGrade,
    public signedUpAt: Date,
  ) {}
}
