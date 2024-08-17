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

// TODO: .env File Validation
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

  // Sentry
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly SENTRY_DSN: string;

  @IsBoolean()
  @Type(() => Boolean)
  @Expose()
  readonly USE_SENTRY: boolean;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly DISCORD_WEBHOOK_URL: string;
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
