import { Logger } from '@nestjs/common';
import axios from 'axios';
import { SeverityLevel } from './constants/severity-level';

export class ReportProvider {
  static error(
    error: Error,
    extra?: Record<string, unknown>,
    moduleName?: string,
  ): void {
    this.errorReport(SeverityLevel.Error, error, extra, moduleName);
  }

  static info(
    message: string,
    extra?: Record<string, unknown>,
    moduleName?: string,
  ): void {
    this.sendToDiscord({
      severity: SeverityLevel.Warning,
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
    this.errorReport(SeverityLevel.Warning, error, extra, moduleName);
  }

  private static errorReport(
    severity: SeverityLevel,
    error: Error,
    extra?: Record<string, unknown>,
    moduleName?: string,
  ): void {
    // Send error to Discord
    this.sendToDiscord({
      severity,
      title: error.message,
      error,
      extra,
      moduleName,
    });
  }

  static reportChatIssue(info: Record<string, unknown>): void {
    this.sendToDiscord(
      {
        severity: SeverityLevel.Info,
        title: '부적절한 채팅 신고',
        extra: info,
      },
      process.env.DISCORD_WEBHOOK_URL_FOR_REPORTING_DISRUCTIVE_CHAT!,
    );
  }

  private static sendToDiscord(
    params: {
      severity: SeverityLevel;
      title: string;
      error?: Error;
      extra?: Record<string, unknown>;
      moduleName?: string;
    },
    customWebhookUrl?: string,
  ): void {
    const { severity, title, error, extra, moduleName } = params;
    let color: number;
    switch (severity) {
      case SeverityLevel.Error:
        color = 15400960;
        break;
      case SeverityLevel.Warning:
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
      .post(customWebhookUrl ?? process.env.DISCORD_WEBHOOK_URL!, data)
      .catch((err) => Logger.error(err));
  }
}
