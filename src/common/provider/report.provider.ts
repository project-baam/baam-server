import * as Sentry from '@sentry/node';

export class ReportProvider {
  static report(error: Error, extra: Record<string, unknown>): void {
    Sentry.withScope((scope) => {
      Object.entries(extra).forEach(([key, value]) =>
        scope.setExtra(key, value),
      );
      Sentry.captureException(error);
    });
  }
}
