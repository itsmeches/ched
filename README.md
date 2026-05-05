# CALABARZON Research Information System (CRIS)

CRIS is a role-based research management platform for handling research proposal submission, review, approval, and archival across the CALABARZON region. It is built around a Laravel 11 backend with an Inertia.js + React interface, and supports three primary user groups: Super Admin, CHED reviewers, and HEI researchers.

The system includes a public research archive and public paper detail pages, plus global light/dark mode support across authenticated and public views.

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
- Global light/dark mode using a shared theme context (authenticated + public pages)
- Responsive admin tables with mobile column-priority behavior
- Collapsible history view grouped by paper for high-volume activity logs
- Standardized empty states and destructive-action confirmation dialogs
- Security hardening for CSP, frame protection, CORS, API fallback handling, and scanner-friendly asset serving

## Recent UX/UI Updates (May 2026)

The following front-end improvements were recently applied without changing business rules or workflow logic:

- Improved dark mode coverage for profile settings, auth pages, and shared controls
- Added public research detail theme toggle (light/dark) with persistent preference
- Standardized table empty states through a shared reusable component
- Consolidated destructive confirms via a shared helper for safer and consistent actions
- Added mobile responsiveness improvements to admin filters, table cards, and drawer footers
- Added responsive column visibility for high-density tables (show key columns first on small screens)
- Refined timeline-heavy history screens by grouping entries into collapsible paper-based sections

These updates are focused on readability, scalability, and mobile usability for large datasets and high-activity roles.

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

## Documentation Scope

This root README is intentionally project-level.

- Product overview, architecture, and repository structure are documented here.
- App operations (setup, routes, API endpoints, security scripts, and runtime commands) are documented in [Backend/cris-backend/README.md](Backend/cris-backend/README.md).

## Quick Start

For local installation and day-to-day commands, go directly to [Backend/cris-backend/README.md](Backend/cris-backend/README.md).

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
