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

  static info(
    message: string,
    extra?: Record<string, unknown>,
    moduleName?: string,
  ): void {
    Sentry.captureEvent({
      message,
      extra: { ...extra, moduleName },
      level: 'info',
    });

    this.sendToDiscord({
      severity: 'info',
      title: message,
      extra,
      moduleName,
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
    this.sendToDiscord({
      severity,
      title: error.message,
      error,
      extra,
      moduleName,
    });
  }

  private static sendToDiscord(params: {
    severity: SeverityLevel;
    title: string;
    error?: Error;
    extra?: Record<string, unknown>;
    moduleName?: string;
  }): void {
    const { severity, title, error, extra, moduleName } = params;
    let color: number;
    switch (severity) {
      case 'error':
        color = 15400960;
        break;
      case 'warning':
        color = 16744770;
        break;

      default:
        color = 3742673;
        break;
    }

    const data = {
      embeds: [
        {
          title: [severity, moduleName, title].filter(Boolean).join(' - '),
          color,
          description: error?.stack,
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
