# CALABARZON Research Information System (CRIS)

CRIS is a role-based research management platform for handling research proposal submission, review, approval, and archival across the CALABARZON region. It is built around a Laravel 11 backend with an Inertia.js + React interface, and supports hierarchical user management from CHED down to HEI, Faculty, and Student accounts.

The system includes a public research archive and public paper detail pages, plus global light/dark mode support across authenticated and public views.

## Overview

The application is designed to centralize the lifecycle of institutional research proposals.

- HEI researchers can submit and manage research proposals.
- CHED reviewers can review submissions and issue decisions.
- Super Admins can manage users, institutions, keywords, and monitor the system.
- CHED, HEI, and Faculty users can manage subordinate accounts in a role-based hierarchy.
- Public users can browse the public research archive.

The active production-style application lives inside [Backend/cris-backend](Backend/cris-backend). It contains both the Laravel backend and the Inertia-powered React frontend.

## Core Features

- Role-based authentication and authorization
- Stable Inertia auth redirect flow for login/logout with current CSRF handling
- HEI proposal submission and editing workflow
- CHED review and decision management
- Super Admin management for users, institutions, and keywords
- Public research archive and file download endpoints
- Proposal history and CSV export
- Edit permission request workflow for restricted proposal updates
- Hierarchical account creation and tracking (CHED to HEI to Faculty to Student)
- Automated CHED 4-A HEI import command with institution-first creation and CSV audit report output
- Global light/dark mode using a shared theme context (authenticated + public pages)
- Responsive admin tables with mobile column-priority behavior
- Collapsible history view grouped by paper for high-volume activity logs
- Standardized empty states and destructive-action confirmation dialogs
- Security hardening for CSP, frame protection, CORS, API fallback handling, and scanner-friendly asset serving

## Recent UX/UI Updates (May 2026)

The following front-end improvements were applied without changing business rules or workflow logic:

- Improved dark mode coverage for profile settings, auth pages, and shared controls
- Added public research detail theme toggle (light/dark) with persistent preference
- Standardized table empty states through a shared reusable component
- Consolidated destructive confirms via a shared helper for safer and consistent actions
- Added mobile responsiveness improvements to admin filters, table cards, and drawer footers
- Added responsive column visibility for high-density tables (show key columns first on small screens)
- Refined timeline-heavy history screens by grouping entries into collapsible paper-based sections
- Added searchable institution selection in Super Admin account creation for large institution datasets
- Improved create-account input autofill consistency in light mode to prevent inner field tint artifacts

## Engineering Improvements — Phases 1–4 (May 2026)

A four-phase pass tightened tooling, refactored the backend, hardened the app for production, and broke up the largest frontend components. Each phase shipped as independent, reviewable commits and is non-breaking.

### Phase 1 — Tooling & Code Quality

- Laravel Pint, ESLint, Prettier, and Husky + `lint-staged` pre-commit hooks across PHP and JS.
- GitHub Actions `quality.yml` workflow runs lint + format checks on every push/PR.
- A11y bug fixes in shared components (`Dropdown`, taxonomy admin pages, history filters, profile form).
- Auto-format pass over the whole codebase to establish a clean baseline.

### Phase 2 — Backend Refactor

- Extracted `ResearchProposalController` write paths into dedicated action classes: `SubmitProposalAction`, `UpdateProposalAction`, `ReviewProposalAction`.
- Introduced an `InteractsWithProposalMutations` trait to share file handling, audit/history writes, and notification dispatch.
- Controller dropped from ~400 LOC of mixed orchestration to a thin HTTP layer that delegates to actions.

### Phase 3 — Production Readiness

- Sentry wired up for both PHP (`config/sentry.php`) and the React app (`resources/js/sentry.js`).
- Added a search-indexes migration for hot research-table columns.
- Public research index caches its query/facet payload via `Cache::remember` to absorb traffic spikes.
- Laravel Scout configured with `SCOUT_DRIVER=null` by default; MeiliSearch is a documented opt-in switch.
- Queue worker runbook + Redis and MeiliSearch swap-in playbooks added to `Backend/cris-backend/DEPLOYMENT.md`.
- `ResearchProposal` model gained derived helpers (display year, normalized keywords, etc.) used by the public archive.

### Phase 4 — Frontend Engineering

- Split the three oversized React surfaces into focused children, no behavior changes:
    - `Pages/Research/Show.jsx` (986 → ~220 LOC) → `Show/{ResearchHeader, WorkflowProgress, EditPermissionRequests, PdfViewer, ResearchTimeline, StudentLockSection, RejectModal}.jsx`
    - `Pages/Research/PublicIndex.jsx` (1042 → ~330 LOC) → `PublicIndex/{SearchHero, FilterSummary, ResultsList, SaveSearchModal}.jsx`
    - `Components/Navbar.jsx` (814 → ~120 LOC) → `Navbar/{DesktopNav, MobileNav, NotificationsDropdown, UserMenu}.jsx` + `useNavItems` and `useNotifications` hooks.
- Expanded Vitest coverage with colocated `__tests__/` suites for the new children and hooks.
- Accessibility polish: `aria-label` on primary and public navigation landmarks.
- TypeScript foundation: strict `tsconfig.json` with `allowJs: true` (existing `.jsx` works untouched), `npm run typecheck` script, and the three pure utilities (`date`, `reviewRemarkTemplates`, `citations`) converted to `.ts`. Migration plan and conventions live in [Backend/cris-backend/docs/typescript-migration.md](Backend/cris-backend/docs/typescript-migration.md).

## Reliability and Security (May 2026)

- Hardened request headers and CSP behavior through centralized middleware.
- Removed `unsafe-eval` from CSP and kept environment-aware policy behavior (local development vs production-style security).
- Improved auth session flow handling to avoid stale-token behavior after login/logout transitions.
- Added explicit session-cookie security configuration defaults in `.env.example`.
- Extended Apache web-root protections for sensitive file exposure reduction.

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
- Create and monitor linked HEI accounts

### HEI Researcher

- Access the HEI dashboard
- Submit research proposals
- Edit eligible proposals
- Track proposal progress and history
- Manage subordinate Faculty accounts

### Faculty

- Access Faculty dashboard
- Manage subordinate Student accounts
- Participate in role-specific proposal workflows

### Student

- Access Student dashboard
- Participate in institution-linked research workflows based on permissions

## Architecture

### Main App

- Laravel 11
- Inertia.js
- React 18
- Vite (esbuild handles `.ts`/`.tsx` natively)
- TypeScript (incremental adoption — utilities first)
- Ant Design
- Tailwind CSS
- Laravel Sanctum
- Ziggy

### Supporting Pieces

- REST-style API endpoints under `/api`
- CSV export for history
- Security middleware for HTTP headers and CSP
- Scan-time proxy/sanitizer workflow for ZAP verification
- Laravel Scout (driver-pluggable; defaults to `null` / DB `LIKE`, MeiliSearch is opt-in)
- Sentry monitoring for backend (PHP) and frontend (React)
- Action classes + a shared `InteractsWithProposalMutations` trait for proposal write paths
- Queue worker (DB driver by default, Redis-ready) with a documented failed-job runbook

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

## Testing Status

- Backend test suite is operational with Laravel PHPUnit.
- Frontend unit tests are available through Vitest, with coverage targeting the new split subcomponents and Navbar hooks.
- TypeScript type-checking is wired up via `npm run typecheck` (no emit — esbuild still handles transforms).
- Browser-level checks are available through Playwright.

See [Backend/cris-backend/README.md](Backend/cris-backend/README.md) for exact commands.

## Data Import Automation

The application now includes a CHED HEI import command that can:

- fetch schools from the CHED API endpoint,
- create institutions first,
- create or match HEI accounts under CHED ownership,
- handle shared contact emails safely,
- produce CSV import audit reports for verification.

Recent validation checks confirm successful active-school import runs with CSV-to-database integrity verification.

Operational usage and options are documented in [Backend/cris-backend/README.md](Backend/cris-backend/README.md).

## Development Notes

- The integrated app uses Laravel + Inertia, not the standalone `Frontend` folder.
- If port `8000` is already occupied, run the app on `8001` and update `APP_URL` if needed.
- For local development, Vite usually runs on `5173`.
- Security headers are relaxed only where necessary for local developer workflow and kept strict for production-style behavior.
- For ZAP and CSP validation, run production-style scans with `APP_ENV=production` and `APP_DEBUG=false`.

## Documentation

Additional project docs are available in the repository:

- [INERTIA_SETUP_GUIDE.md](INERTIA_SETUP_GUIDE.md)
- [NAVBAR_DESIGN_GUIDE.md](NAVBAR_DESIGN_GUIDE.md)
- [Guide/CRIS_Progress_Report_Guide.md](Guide/CRIS_Progress_Report_Guide.md)

## License

This project is provided for academic and institutional use. If you intend to publish or distribute it formally, add the appropriate license for your organization or capstone requirements.
