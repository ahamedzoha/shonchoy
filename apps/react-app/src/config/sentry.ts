import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  // Performance Monitoring
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // Capture 100% of transactions in development, 10% in production
  // Release tracking
  release: import.meta.env.VITE_APP_VERSION || "1.0.0",
  // Ignore certain errors
  beforeSend(event, hint) {
    // Filter out network errors that are expected (like 401, 403)
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status?: number }).status;
        if (status === 401 || status === 403) {
          return null; // Don't send these to Sentry
        }
      }
    }
    return event;
  },
});

export default Sentry;
