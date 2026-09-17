import * as Sentry from "@sentry/node";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  environment: isProd ? "production" : "development",
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export function logError(message: string, error?: unknown, context?: Record<string, any>) {
  // Structured logging to stdout for Datadog / CloudWatch / etc.
  const errorObj = error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error;
  
  console.error(JSON.stringify({
    level: "error",
    timestamp: new Date().toISOString(),
    message,
    error: errorObj,
    context
  }));

  // Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      scope.setExtra("errorObj", errorObj);
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(message);
      }
    });
  }
}

export function logInfo(message: string, context?: Record<string, any>) {
  console.info(JSON.stringify({
    level: "info",
    timestamp: new Date().toISOString(),
    message,
    context
  }));
}
