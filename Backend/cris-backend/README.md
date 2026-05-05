# CALABARZON Research Information System (CRIS)

## Overview

This directory contains the main CRIS application:

- Laravel 11 backend
- Inertia.js + React frontend
- Role-based workflows for Super Admin, CHED, HEI, Faculty, and Student users
- Public research archive and public paper detail pages

CRIS manages end-to-end research submission, review, approval, archival, and audit/history tracking for Region IV-A institutions.

This README is operations-focused for this app folder (setup, commands, routes, API, and deployment build flow). For repository-level overview and broader project context, see [../../README.md](../../README.md).

## Core Capabilities

- Authentication and role-based authorization
- Research submission and multi-stage review workflow
- CHED decisioning and review history
- Admin management for users, institutions, keywords, and taxonomy
- Public research listing and detail pages with PDF viewing/downloading
- History page with filters, CSV export (super_admin), and collapsible grouping by paper
- Global light/dark mode support (authenticated and public views)
- Responsive admin tables with mobile column-priority behavior
- Shared empty states and standardized confirmation dialogs

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

## Production Build

```bash
npm run build
```

The build pipeline includes a sanitizer step for generated assets to reduce scanner false positives.

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

## License

This project follows the Laravel ecosystem licensing model and dependencies under their respective licenses.
