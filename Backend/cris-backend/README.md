# CALABARZON Research Information System (CRIS)

## 5-Minute Quickstart

Run this from this folder (Backend/cris-backend).

Windows (PowerShell):

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8001
```

In another terminal:

```bash
npm run dev
```

macOS/Linux:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8001
```

In another terminal:

```bash
npm run dev
```

Open http://127.0.0.1:8001

## Troubleshooting

### 1. Missing app key

Symptoms:

- "No application encryption key has been specified"

Fix:

```bash
php artisan key:generate
```

### 2. Database connection refused

Symptoms:

- SQLSTATE connection errors
- Migration fails with access denied or cannot connect

Checklist:

- Confirm DB service is running.
- Verify .env values for DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, and DB_PASSWORD.
- Clear config cache after changing env values.

Fix:

```bash
php artisan config:clear
php artisan migrate --seed
```

### 3. Vite port conflict

Symptoms:

- Frontend assets do not load in dev
- Vite fails to start on default port

Fix options:

- Stop the process already using port 5173, then rerun npm run dev.
- Or run Vite on another port.

```bash
npm run dev -- --port 5174
```

## Overview

This directory contains the main CRIS application:

- Laravel 11 backend
- Inertia.js + React frontend
- Role-based workflows for Super Admin, CHED, HEI, Faculty, and Student users
- Hierarchical account management (CHED to HEI to Faculty to Student)
- Public research archive and public paper detail pages

CRIS manages end-to-end research submission, review, approval, archival, and audit/history tracking for Region IV-A institutions.

This README is operations-focused for this app folder (setup, commands, routes, API, and deployment build flow). For repository-level overview and broader project context, see [../../README.md](../../README.md).

## Core Capabilities

- Authentication and role-based authorization
- Stable Inertia auth redirects for login/logout with current CSRF handling
- Research submission and multi-stage review workflow
- CHED decisioning and review history
- Admin management for users, institutions, keywords, and taxonomy
- Searchable institution selection in Super Admin account creation for large institution lists
- Public research listing and detail pages with PDF viewing/downloading
- Citation tools on research detail pages (copy citation, export RIS, export BIB)
- History page with filters, CSV export (super_admin), and collapsible grouping by paper
- Global light/dark mode support (authenticated and public views)
- Responsive admin tables with mobile column-priority behavior
- Shared empty states and standardized confirmation dialogs
- CHED HEI importer with institution-first creation and CSV audit output

## Stack

- PHP 8.2+
- Laravel 11
- React 18
- Inertia.js
- Vite
- Ant Design
- Tailwind CSS
- MySQL or MariaDB

## Local Setup

### 1. Install backend dependencies

```bash
composer install
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure environment

Windows:

```bash
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Then edit .env with database values.

Example:

```env
APP_NAME=CRIS
APP_URL=http://127.0.0.1:8001

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cris_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### 4. Generate application key

```bash
php artisan key:generate
```

### 5. Run migrations and seeders

```bash
php artisan migrate --seed
```

### 6. Start the app

Terminal 1:

```bash
php artisan serve --host=127.0.0.1 --port=8001
```

Terminal 2:

```bash
npm run dev
```

Open:

- http://127.0.0.1:8001

## Test Commands

Backend tests:

```bash
php artisan test
```

Frontend unit tests (Vitest):

```bash
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage
```

Browser tests (Playwright):

```bash
npm run test:browser:install
npm run test:browser
```

## Production Build

```bash
npm run build
```

The build pipeline includes a sanitizer step for generated assets to reduce scanner false positives.

## CHED HEI Import Automation

Use the importer to pull HEIs from CHED API, create institutions, create or match HEI accounts, and export a CSV audit report.

Base command:

```bash
php artisan ched4a:import-heis
```

Common options:

- --active-only
- --dry-run
- --update-existing
- --ched-email=ched@cris.gov.ph
- --password=ChangeMe123!
- --report-path=app/reports/ched4a-heis-latest.csv

Examples:

```bash
php artisan ched4a:import-heis --active-only --dry-run --report-path=app/reports/ched4a-heis-latest.csv
php artisan ched4a:import-heis --active-only --report-path=app/reports/ched4a-heis-write.csv
```

Behavior highlights:

- Institutions are created or matched first.
- HEI users are then created or matched under CHED ownership.
- Shared contact emails are handled safely.
- Repeated runs are idempotent.
- CSV report includes institution and HEI action metadata per row.

Validation highlights:

- Active-school import run validated with CSV-to-database integrity checks.
- Duplicate email edge cases are handled by deterministic suffixing.
- Final verification utility script confirms email + institution alignment.

## Main Routes

### Public

- /
- /public/research
- /public/research/{proposal}
- /public/research/{proposal}/file

### Authenticated

- /dashboard
- /profile
- /research
- /history
- /history/export

### Role-focused Areas

- /hei/dashboard
- /ched/dashboard
- /ched/decisions
- /admin/dashboard
- /admin/users
- /admin/institutions
- /admin/keywords
- /admin/taxonomy
- /accounts/create
- /accounts/hierarchy

## API Summary

### Authentication

- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

### Proposals

- GET /api/proposals
- POST /api/proposals
- GET /api/proposals/{proposal}
- PUT /api/proposals/{proposal}
- DELETE /api/proposals/{proposal}
- POST /api/proposals/{proposal}/review

### Institutions

- GET /api/institutions
- POST /api/institutions
- GET /api/institutions/{institution}
- PUT /api/institutions/{institution}
- DELETE /api/institutions/{institution}

## Seeded Development Accounts

| Role           | Email                  | Password |
| -------------- | ---------------------- | -------- |
| Super Admin    | superadmin@cris.gov.ph | password |
| CHED Reviewer  | ched@cris.gov.ph       | password |
| HEI Researcher | hei@edu.ph             | password |

## Developer Utility Scripts

Available scripts in scripts/dev:

- check_user.php
- check_users.php
- test_login.php
- final_import_check.php

Run final import validation:

```bash
php scripts/dev/final_import_check.php
```

## Important Directories

```text
cris-backend/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
├── resources/
│   ├── js/
│   ├── css/
│   └── views/
├── routes/
├── scripts/
└── tests/
```

## Security Notes

The app includes security hardening for:

- Content Security Policy handling
- Frame protection and secure headers
- CORS controls
- Safe API fallback behavior
- Scanner-compatible asset output

Recent hardening updates:

- Added strict security headers via middleware (frame, content-type, referrer, permissions).
- CSP is environment-aware:
    - Local development keeps allowances required by Vite HMR.
    - Non-local environments use nonce-based script/style policy without `unsafe-eval`.
- Session cookie settings are explicitly documented in `.env.example` (`SESSION_HTTP_ONLY`, `SESSION_SECURE_COOKIE`, session lifetime settings).
- Public web root `.htaccess` includes additional restrictions and disclosure-reduction headers for Apache deployments.

ZAP scanning guidance:

- Run production-style scans with `APP_ENV=production` and `APP_DEBUG=false` to evaluate strict CSP behavior.
- In local mode, some alerts can be expected due to development tooling requirements.

## Repo Hygiene

- Keep secrets only in .env and never commit local env variants.
- Use .env.example as the onboarding template.
- Generated importer reports are ignored under storage/app/reports.

## License

This project follows the Laravel ecosystem licensing model and dependencies under their respective licenses.
