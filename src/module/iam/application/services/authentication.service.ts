import { Injectable, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SocialStrategy } from "../port/social-strategy.interface";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
  )
}