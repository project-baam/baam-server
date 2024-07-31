import { Controller, Post, Body } from '@nestjs/common';
import { AuthenticationService } from '../../../application/services/authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  async login(@Body() body: { token: string, provider: string }) {
    const user = await this.authenticationService.validateOAuthLogin(
      body.token,
      body.provider,
    );
    return this.authenticationService.login(user);
  }

  @Post('refresh')
  async refreshTokens(@Body() body: { refreshToken: string }) {
    return this.authenticationService.refreshTokens(body.refreshToken);
  }
}
