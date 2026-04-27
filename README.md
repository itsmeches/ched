# Calabarzon Research Information System (CRIS)

CRIS is a role-based research management platform for handling research proposal submission, review, approval, and archival across the CALABARZON region. It is built around a Laravel 11 backend with an Inertia.js + React interface, and supports three primary user groups: Super Admin, CHED reviewers, and HEI researchers.

## Overview

The application is designed to centralize the lifecycle of institutional research proposals.

- HEI researchers can submit and manage research proposals.
- CHED reviewers can review submissions and issue decisions.
- Super Admins can manage users, institutions, keywords, and monitor the system.
- Public users can browse the public research archive.

The active production-style application lives inside [Backend/cris-backend](Backend/cris-backend). It contains both the Laravel backend and the Inertia-powered React frontend.

## Core Features

- Role-based authentication and authorization
- HEI proposal submission and editing workflow
- CHED review and decision management
- Super Admin management for users, institutions, and keywords
- Public research archive and file download endpoints
- Proposal history and CSV export
- Edit permission request workflow for restricted proposal updates
- Security hardening for CSP, frame protection, CORS, API fallback handling, and scanner-friendly asset serving

## User Roles

### Super Admin

- Access the admin dashboard
- Manage users
- Manage institutions
- Manage keywords
- View system-wide research activity

### CHED Reviewer

- Access the CHED dashboard
- Review and decide on research proposals
- Access a dedicated My Decisions page
- View research history

### HEI Researcher

- Access the HEI dashboard
- Submit research proposals
- Edit eligible proposals
- Track proposal progress and history

## Architecture

### Main App

- Laravel 11
- Inertia.js
- React 18
- Vite
- Ant Design
- Tailwind CSS
- Laravel Sanctum
- Ziggy

### Supporting Pieces

- REST-style API endpoints under `/api`
- CSV export for history
- Security middleware for HTTP headers and CSP
- Scan-time proxy/sanitizer workflow for ZAP verification

## Repository Structure

```text
CHED/
├── Backend/
│   └── cris-backend/          # Main Laravel + Inertia application
├── Guide/                     # Documentation and progress guides
├── INERTIA_SETUP_GUIDE.md
└── NAVBAR_DESIGN_GUIDE.md
```

### Important Directories in the Main App

```text
Backend/cris-backend/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
├── resources/
│   ├── js/                    # Inertia React pages and components
│   ├── css/
│   └── views/
├── routes/
├── scripts/                   # ZAP proxy and asset sanitizing scripts
└── tests/
```

## Main Routes

### Public

- `/`
- `/public/research`
- `/public/research/{proposal}`
- `/public/research/{proposal}/file`

### Authenticated

- `/dashboard`
- `/profile`
- `/research`
- `/history`
- `/history/export`

### Role-Specific

- `/hei/dashboard`
- `/ched/dashboard`
- `/ched/decisions`
- `/admin/dashboard`
- `/admin/users`
- `/admin/institutions`
- `/admin/keywords`

## Default Seeded Accounts

These accounts are created by the database seeder for local development.

| Role           | Email                    | Password   |
| -------------- | ------------------------ | ---------- |
| Super Admin    | `superadmin@cris.gov.ph` | `password` |
| CHED Reviewer  | `ched@cris.gov.ph`       | `password` |
| HEI Researcher | `hei@edu.ph`             | `password` |

## Prerequisites

Before running the system locally, install:

- PHP 8.2+
- Composer
- Node.js 18+
- npm
- MySQL or MariaDB

## Local Setup

All commands below are for the main integrated app in [Backend/cris-backend](Backend/cris-backend).

### 1. Install Backend Dependencies

```bash
cd Backend/cris-backend
composer install
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment

Create the environment file:

```bash
copy .env.example .env
```

Then update database settings in `.env`.

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

### 4. Generate App Key

```bash
php artisan key:generate
```

### 5. Run Migrations and Seeders

```bash
php artisan migrate --seed
```

### 6. Start the App

Run the Laravel server in one terminal:

```bash
php artisan serve --host=127.0.0.1 --port=8001
```

Run Vite in another terminal:

```bash
npm run dev
```

Open the app at:

```text
http://127.0.0.1:8001
```

## Production Build

To build the frontend assets:

```bash
npm run build
```

This also runs the asset sanitizer used to prevent scanner false positives such as Unix timestamp disclosure warnings in generated bundles.

## API Summary

The application also exposes API endpoints under `/api`.

### Authentication

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Research Proposals

- `GET /api/proposals`
- `POST /api/proposals`
- `GET /api/proposals/{proposal}`
- `PUT /api/proposals/{proposal}`
- `DELETE /api/proposals/{proposal}`
- `POST /api/proposals/{proposal}/review`

### Institutions

- `GET /api/institutions`
- `POST /api/institutions`
- `GET /api/institutions/{institution}`
- `PUT /api/institutions/{institution}`
- `DELETE /api/institutions/{institution}`

## Security Notes

The app includes a hardening layer intended to reduce common web risks and support security scanning.

- Content Security Policy with nonce support
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`
- API JSON fallback for unknown routes
- Reduced information leakage in redirects and exception responses
- Scanner-friendly asset sanitizing for built JavaScript files
- Optional ZAP scan proxy workflow for consistent local scanning behavior

## ZAP / Scan Mode

The repository includes helper scripts for local security scanning.

### Backend Scripts

- `composer serve:zap-backend`
- `composer serve:zap`
- `composer serve:secure`

### Frontend / Proxy Scripts

- `npm run build:zap`
- `npm run zap:proxy`

These are primarily intended for local scan verification and are not the standard development workflow.

## Testing

Run the Laravel test suite:

```bash
php artisan test
```

There is also a hardening-focused test script:

```bash
composer test:hardening
```

## Development Notes

- The integrated app uses Laravel + Inertia, not the standalone `Frontend` folder.
- If port `8000` is already occupied, run the app on `8001` and update `APP_URL` if needed.
- For local development, Vite usually runs on `5173`.
- Security headers are relaxed only where necessary for local developer workflow and kept strict for production-style behavior.

## Documentation

Additional project docs are available in the repository:

- [INERTIA_SETUP_GUIDE.md](INERTIA_SETUP_GUIDE.md)
- [NAVBAR_DESIGN_GUIDE.md](NAVBAR_DESIGN_GUIDE.md)
- [Guide/CRIS_Progress_Report_Guide.md](Guide/CRIS_Progress_Report_Guide.md)

## License

This project is provided for academic and institutional use. If you intend to publish or distribute it formally, add the appropriate license for your organization or capstone requirements.
