import { EnvironmentService } from '../../environment/environment.service';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class OrmConfigService implements TypeOrmOptionsFactory {
  constructor(private environmentService: EnvironmentService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.environmentService.get<string>('DB_HOST'),
      port: this.environmentService.get<number>('DB_PORT'),
      username: this.environmentService.get<string>('DB_USER'),
      password: this.environmentService.get<string>('DB_PASSWORD'),
      database: this.environmentService.get<string>('DB_NAME'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: this.environmentService.get<boolean>('DB_USE_SYNCHRONIZE'),
      namingStrategy: new SnakeNamingStrategy(),
      logging: true,
    };
  }
}
