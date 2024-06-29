import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../constants/authentication';
import {
  InvalidAccessTokenError,
  MissingAuthTokenError,
} from 'src/common/types/error/application-exceptions';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new MissingAuthTokenError();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request[REQUEST_USER_KEY] = payload;
    } catch (err) {
      throw new InvalidAccessTokenError();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
