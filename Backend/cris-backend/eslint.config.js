import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: [
            'public/build/**',
            'public/hot',
            'vendor/**',
            'node_modules/**',
            'storage/**',
            'bootstrap/cache/**',
            'resources/js/ziggy.js',
            'coverage/**',
            'test-results/**',
        ],
    },
    js.configs.recommended,
    {
        files: ['resources/js/**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                route: 'readonly',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
        },
        settings: {
            react: { version: '18.2' },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/jsx-uses-react': 'off',
            'react/no-unknown-property': ['error', { ignore: ['head-key'] }],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'jsx-a11y/no-autofocus': 'off',
        },
    },
    {
        files: ['**/*.test.{js,jsx}', 'resources/js/test/**/*.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                vi: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
        rules: {
            'no-console': 'off',
        },
    },
    prettier,
];
