# TypeScript Migration

The frontend is being migrated from JavaScript to TypeScript incrementally. The build pipeline already handles `.ts/.tsx` natively (Vite/esbuild) — no plugin changes were needed.

## Current state (2026-05-21)

- `tsconfig.json` is in place at the repo root with `strict: true`, `allowJs: true`, `checkJs: false`, `noEmit: true`
- `npm run typecheck` runs `tsc --noEmit` and currently passes with 0 errors
- Existing `.js`/`.jsx` files continue to work unchanged

## Conversion order

Pure utilities first, then leaf components, then orchestrator pages. Convert one chunk per commit so the diff stays reviewable.

### Phase 1 — Utilities (in progress)

- [x] `resources/js/utils/date.ts`
- [x] `resources/js/utils/reviewRemarkTemplates.ts`
- [x] `resources/js/utils/citations.ts`
- [ ] `resources/js/utils/designTokens.js` — mixes hooks + data; defer
- [ ] `resources/js/utils/ThemeContext.jsx` — context + provider; defer

### Phase 2 — Leaf presentational components

Targets with no business logic and well-defined props (e.g. the new `Pages/Research/Show/*.jsx` and `Pages/Research/PublicIndex/*.jsx` children). Define a `Props` type per component.

### Phase 3 — Hooks

`useNavItems`, `useNotifications`, etc. Hook signatures are easy to type; the consumer side benefits immediately.

### Phase 4 — Page-level orchestrators

Last, because they touch Inertia page props. We may want generated types for those (e.g. via `tightenco/ziggy` + a Laravel type generator) before doing this.

## Conventions

- One `Props` interface or type alias per component, defined just above the component
- No `any` without an inline `// eslint-disable-next-line` comment that explains why
- Prefer `interface` for object shapes that may be extended, `type` for unions / mapped types
- Don't add runtime validation (Zod, Yup) just to support typing — types are compile-time only

## Inertia page-prop types

Out of scope for now. Each page currently destructures props directly. When we revisit, the cleanest path is a generated `inertia.d.ts` file via Spatie's `laravel-data` or similar — not hand-typing each page.

## How to convert a file

1. Rename `.js` → `.ts` (or `.jsx` → `.tsx`).
2. Run `npm run typecheck` and address any new errors.
3. Add explicit return types and prop interfaces.
4. Remove redundant runtime defensive checks if the type now makes them impossible.
5. Run `npm run test:unit` and `npx vite build --mode development` as a smoke test.
