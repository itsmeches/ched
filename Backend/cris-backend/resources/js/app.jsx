import '../css/app.css';
import 'antd/dist/reset.css';
import './bootstrap';

import { ConfigProvider } from 'antd';
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
            <ConfigProvider
                csp={cspNonce ? { nonce: cspNonce } : undefined}
                theme={{
                    token: {
                        colorPrimary: '#0033a0',
                        colorInfo: '#0033a0',
                        borderRadius: 14,
                        fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif',
                    },
                    components: {
                        Card: {
                            borderRadiusLG: 22,
                        },
                        Button: {
                            borderRadius: 12,
                        },
                        Table: {
                            headerBg: '#f8fafc',
                            headerColor: '#475569',
                        },
                    },
                }}
            >
                <App {...props} />
            </ConfigProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
