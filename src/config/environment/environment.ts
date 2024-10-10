import { Expose, plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsPositive,
  IsString,
  validateSync,
} from 'class-validator';
import path from 'path';
import { LogProvider } from 'src/common/provider/log.provider';

export enum SupportedEnvironment {
  local = 'local',
  development = 'development',
  production = 'prod',
}

export class EnvironmentVariables {
  // STAGE Environment
  @IsEnum(SupportedEnvironment)
  @Expose({ name: 'NODE_ENV' })
  readonly ENV: SupportedEnvironment;

  // API SERVICE VARIABLE
  @IsPositive()
  @Type(() => Number)
  @Expose()
  readonly PORT: number;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly HTTP_BODY_SIZE_LIMIT: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly HTTP_URL_LIMIT: string;

  // DB
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly DB_HOST: string;

  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number)
  @Expose()
  readonly DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly DB_NAME: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly DB_USER: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly DB_PASSWORD: string;

  @IsBoolean()
  @Type(() => Boolean)
  @Expose()
  readonly DB_USE_SYNCHRONIZE: boolean;

  // JWT
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly JWT_TOKEN_AUDIENCE: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly JWT_TOKEN_ISSUER: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly JWT_ACCESS_TOKEN_TTL: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly JWT_REFRESH_TOKEN_TTL: string;

  // In-momory DB
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly REDIS_PATH: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly NEIS_API_KEY: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly DISCORD_WEBHOOK_URL: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly DISCORD_WEBHOOK_URL_FOR_REPORTING_DISRUCTIVE_CHAT: string;

  // 카카오 로그인
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly KAKAO_CLIENT_ID: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly KAKAO_CLIENT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly KAKAO_REDIRECT_URI: string;

  // Apple 로그인
  // @IsNotEmpty()
  // @IsString()
  // @Expose()
  // readonly APPLE_TEAM_ID: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly APPLE_APP_ID: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly APPLE_BUNDLE_ID: string;

  // TODO:
  // @IsNotEmpty()
  // @IsString()
  // @Expose()
  // readonly APPLE_PRIVATE_KEY: string;

  // @IsNotEmpty()
  // @IsString()
  // @Expose()
  // readonly APPLE_KEY_ID: string;

  // DigitalOcean Spaces Object Storage
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly SPACES_REGION: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly SPACES_ENDPOINT: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly SPACES_KEY: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly SPACES_SECRET: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly SPACES_BUCKET: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly MESSAGE_ENCRYPTION_KEY: string;

  // 푸시 알림
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly FIREBASE_PROJECT_ID: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly FIREBASE_CLIENT_EMAIL: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly FIREBASE_PRIVATE_KEY: string;
}

export const getEnvFilePath = (): string =>
  path.join(
    process.cwd(),
    `/env/.env.${process.env.NODE_ENV ?? SupportedEnvironment.development}`,
  );

export type EnvironmentKey = keyof EnvironmentVariables;

export function validate(
  configuration: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, configuration, {
    excludeExtraneousValues: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    for (const error of errors) {
      const { property, value, constraints } = error;
      LogProvider.info(
        `[${property}: ${value}] ${JSON.stringify(constraints)}`,
        'Environment',
      );
    }

    throw new Error(Object.values(errors[0].constraints!).toString());
  }

  Object.entries(validatedConfig).map((value: [string, unknown]) =>
    LogProvider.info(value.join(':'), 'Environment'),
  );

  return validatedConfig;
}
