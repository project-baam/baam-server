import { Injectable } from '@nestjs/common';
import { EnvironmentKey, SupportedEnvironment } from './environment';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentService {
  constructor(private readonly configService: ConfigService) {}

  get<T>(key: EnvironmentKey): T | undefined {
    return this.configService.get<T>(key);
  }

  isLocal(): boolean {
    return this.get<string>('ENV') === SupportedEnvironment.local;
  }

  isProduction(): boolean {
    return this.get<string>('ENV') === SupportedEnvironment.production;
  }
}
