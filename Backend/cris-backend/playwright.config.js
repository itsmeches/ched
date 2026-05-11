import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/browser',
    timeout: 30_000,
    expect: {
        timeout: 10_000,
    },
    fullyParallel: false,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8000',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'php artisan serve --host=127.0.0.1 --port=8000',
        url: 'http://127.0.0.1:8000/login',
        reuseExistingServer: true,
        timeout: 120_000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});