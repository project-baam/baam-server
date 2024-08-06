import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import axios from 'axios';
import { SeverityLevel } from '@sentry/nestjs';

export class ReportProvider {
  static error(
    error: Error,
    extra?: Record<string, unknown>,
    moduleName?: string,
  ): void {
    this.errorReport('error', error, extra, moduleName);
  }

  static report(
    message: string,
    extra?: Record<string, unknown>,
    moduleName?: string,
  ): void {
    Sentry.captureEvent({
      message,
      extra: { ...extra, moduleName },
      level: 'info',
    });
  }

  static warn(
    error: Error,
    extra?: Record<string, unknown>,
    moduleName?: string,
  ): void {
    this.errorReport('warning', error, extra, moduleName);
  }

  private static errorReport(
    severity: SeverityLevel,
    error: Error,
    extra?: Record<string, unknown>,
    moduleName?: string,
  ): void {
    Sentry.withScope((scope) => {
      if (extra) {
        for (const [key, value] of Object.entries(extra)) {
          scope.setExtra(key, value);
        }
      }

      if (moduleName) {
        scope.setExtra('moduleName', moduleName);
      }
      scope.setLevel(severity);
      Sentry.captureException(error);
    });

    // Send error to Discord
    const data = {
      embeds: [
        {
          title: `[${severity}]: ${error.message}`,
          description: error.stack,
          fields: Object.entries({ ...extra }).map(([key, value]) => ({
            name: key,
            value: JSON.stringify(value),
            inline: true,
          })),
        },
      ],
    };

    axios
      .post(process.env.DISCORD_WEBHOOK_URL!, data)
      .catch((err) => Logger.error(err));
  }
}
