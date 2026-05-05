# CHED CRIS UI/UX Redesign Roadmap

Date: 2026-05-05
Scope: Frontend pages and shared components under Backend/cris-backend/resources/js
Theme Direction: CHED navy-first visual language, consistent light/dark mode, accessibility-first interactions

## 1. UX Goals

1. Improve task completion speed for admin, reviewer, and researcher roles.
2. Reduce visual inconsistency between custom Tailwind forms and Ant Design screens.
3. Standardize interactions (filters, confirmations, loading, success, errors, empty states).
4. Ensure every page is readable and fully usable in dark mode.
5. Improve keyboard and screen-reader accessibility.

## 2. Uniform CHED Design Rules

1. Primary color: #0033a0
2. Light background: #f8fafc
3. Dark background: #0a0f1e
4. Dark surface: #111827
5. Dark border: #1e2d47
6. Secondary text (light): #475569
7. Secondary text (dark): #94a3b8

## 3. Cross-App Improvements (Global)

### 3.1 Design Tokens and Theming

- Add a shared token map for color, spacing, radius, and elevation.
- Replace hardcoded hex values in components with token usage.
- Keep Ant token config aligned with Tailwind token values.

### 3.2 Shared Component Standardization

- Standardize button variants: primary, secondary, danger, ghost.
- Standardize input states: default, hover, focus, error, disabled.
- Standardize card shells for all page sections.
- Standardize modal/dialog behavior and confirmation patterns.
- Standardize empty states and no-result states.

### 3.3 Accessibility Standards

- Add visible focus states for all controls.
- Add aria-label or associated labels for icon-only and non-obvious controls.
- Avoid color-only status cues (add labels/icons).
- Ensure contrast for text and status chips in both themes.

## 4. Page-by-Page Improvement Backlog

### 4.1 Auth Pages

Files:

- Backend/cris-backend/resources/js/Pages/Auth/Login.jsx
- Backend/cris-backend/resources/js/Pages/Auth/Register.jsx
- Backend/cris-backend/resources/js/Pages/Auth/ForgotPassword.jsx
- Backend/cris-backend/resources/js/Pages/Auth/ResetPassword.jsx

Improvements:

- Replace inline hover style mutations with class-based transitions.
- Standardize status alerts and helper text blocks.
- Validate mobile form width and spacing for small screens.
- Ensure all controls have proper label/accessibility wiring.

### 4.2 Dashboard Pages

Files:

- Backend/cris-backend/resources/js/Pages/Dashboard.jsx
- Backend/cris-backend/resources/js/Pages/Dashboard/SuperAdmin.jsx
- Backend/cris-backend/resources/js/Pages/Dashboard/CHED.jsx
- Backend/cris-backend/resources/js/Pages/Dashboard/HEI.jsx
- Backend/cris-backend/resources/js/Pages/Dashboard/Faculty.jsx
- Backend/cris-backend/resources/js/Pages/Dashboard/Student.jsx

Improvements:

- Replace placeholder dashboard root with role-aware landing behavior.
- Unify flash feedback pattern (single source: toast or alert, not both).
- Extract shared reject modal flow into reusable component.
- Improve action feedback after approve/reject transitions.

### 4.3 Admin Pages

Files:

- Backend/cris-backend/resources/js/Pages/Admin/Users/Index.jsx
- Backend/cris-backend/resources/js/Pages/Admin/Users/Create.jsx
- Backend/cris-backend/resources/js/Pages/Admin/Users/Edit.jsx
- Backend/cris-backend/resources/js/Pages/Admin/Institutions/Index.jsx
- Backend/cris-backend/resources/js/Pages/Admin/Institutions/Create.jsx
- Backend/cris-backend/resources/js/Pages/Admin/Institutions/Edit.jsx
- Backend/cris-backend/resources/js/Pages/Admin/Taxonomy/Disciplines.jsx
- Backend/cris-backend/resources/js/Pages/Admin/Taxonomy/Categories.jsx
- Backend/cris-backend/resources/js/Pages/Admin/Keywords/Index.jsx

Improvements:

- Standardize table filter bar layout and action spacing.
- Add consistent empty-state messaging for all list pages.
- Unify destructive action confirmation pattern.
- Improve drawer behavior on mobile by replacing fixed widths.
- Add required-field indicators and clearer form guidance.

### 4.4 Research Pages

Files:

- Backend/cris-backend/resources/js/Pages/Research/Index.jsx
- Backend/cris-backend/resources/js/Pages/Research/Create.jsx
- Backend/cris-backend/resources/js/Pages/Research/Edit.jsx
- Backend/cris-backend/resources/js/Pages/Research/Show.jsx
- Backend/cris-backend/resources/js/Pages/Research/PublicIndex.jsx
- Backend/cris-backend/resources/js/Pages/Research/PublicShow.jsx

Improvements:

- Break large proposal form into smaller focused sections.
- Improve status/editability rendering with dedicated status components.
- Add better mobile affordances for wide tables and multi-filter rows.
- Reuse unified reject modal and remarks validation.
- Improve edit-permission and review-state explanatory copy.

### 4.5 Profile Pages

Files:

- Backend/cris-backend/resources/js/Pages/Profile/Edit.jsx
- Backend/cris-backend/resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx
- Backend/cris-backend/resources/js/Pages/Profile/Partials/UpdatePasswordForm.jsx
- Backend/cris-backend/resources/js/Pages/Profile/Partials/DeleteUserForm.jsx

Improvements:

- Keep profile cards and text fully dark-mode compatible.
- Standardize success feedback visibility for saved states.
- Improve destructive flow guidance before modal open.

### 4.6 Accounts and History

Files:

- Backend/cris-backend/resources/js/Pages/Accounts/Hierarchy.jsx
- Backend/cris-backend/resources/js/Pages/Accounts/Create.jsx
- Backend/cris-backend/resources/js/Pages/Accounts/Edit.jsx
- Backend/cris-backend/resources/js/Pages/History/Index.jsx

Improvements:

- Clarify account hierarchy relationship language.
- Improve deactivated account visibility and status cues.
- Add filtering/search to history for usability at scale.
- Improve history change display readability for object diffs.

## 5. Execution Phases

### Phase 1: Foundation (Uniformity First)

- Establish shared tokens and interaction standards.
- Add reusable EmptyState, ConfirmActionDialog, and FormSection components.
- Align dark mode surface and border behavior globally.

### Phase 2: High-Traffic Flows

- Dashboard pages
- Research Index/Show
- Admin Users and Institutions

### Phase 3: Form Experience Improvements

- Auth pages
- Research Create/Edit
- Profile and Accounts forms

### Phase 4: Reporting and Long-Tail Screens

- History page filters and exports
- Taxonomy/Keywords refinements
- Public pages polish and consistency

## 6. UX Acceptance Checklist (Per Page)

1. Header hierarchy is clear and consistent.
2. Primary action is obvious within 3 seconds.
3. Empty, loading, error, and success states are explicit.
4. Keyboard navigation works end-to-end.
5. Text contrast passes in light and dark themes.
6. Mobile layout avoids overflow and keeps actions reachable.
7. Destructive actions require clear confirmation.
8. Form validation is immediate, readable, and actionable.

## 7. Suggested First Implementation Sprint

1. Build token layer and reusable EmptyState + ConfirmActionDialog.
2. Refactor Admin Users and Institutions list pages to use the new patterns.
3. Refactor Research Index filter bar and status display.
4. Validate visual consistency and dark mode across those pages before scaling to remaining pages.
