let _sentry = null;

async function getSentry() {
  if (!_sentry) {
    _sentry = await import("@sentry/browser");
    _sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      enabled: import.meta.env.PROD,
      tracesSampleRate: 0.1,
      integrations: []
    });
  }

  return _sentry;
}

export async function captureException(err) {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  const sentry = await getSentry();
  sentry.captureException(err);
}

export async function addBreadcrumb(crumb) {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  const sentry = await getSentry();
  sentry.addBreadcrumb(crumb);
}
