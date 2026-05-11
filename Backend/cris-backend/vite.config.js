import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['resources/js/test/setupTests.js'],
        css: true,
        include: ['resources/js/**/*.test.{js,jsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
        },
    },
});
