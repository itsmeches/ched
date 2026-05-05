import '../css/app.css';
import 'antd/dist/reset.css';
import './bootstrap';

import { ThemeProvider } from '@/utils/ThemeContext';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const cspNonce = document
    .querySelector('meta[name="csp-nonce"]')
    ?.getAttribute('content') ?? undefined;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function syncCsrfToken(page) {
    const csrfToken = page?.props?.csrf_token;

    if (csrfToken) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        syncCsrfToken(props?.initialPage ?? props?.page);
        router.on('navigate', (event) => {
            syncCsrfToken(event?.detail?.page);
        });

        root.render(
            <ThemeProvider cspNonce={cspNonce}>
                <App {...props} />
            </ThemeProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
