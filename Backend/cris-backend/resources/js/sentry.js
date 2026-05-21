import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
    Sentry.init({
        dsn,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
        tracesSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        replaysSessionSampleRate: 0,
        sendDefaultPii: false,
    });
}

export default Sentry;
