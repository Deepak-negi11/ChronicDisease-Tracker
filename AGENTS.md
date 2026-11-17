# AGENTS.md

Read this first, then continue from **[PLAN.md](./PLAN.md)**. Milestone 1 is done, so the next task is Milestone 2.

## Architecture

- Vite + React 19 + TypeScript SPA, styled with Tailwind v4 (`@tailwindcss/vite`). Routing uses React Router (`src/App.tsx`), and `netlify.toml` rewrites `/*` to `index.html`.
- There is no backend yet. The planned backend is an **Express app on Netlify Server** (`netlify/server/index.mjs`) with **Netlify Database** (Postgres, Drizzle schema in `db/schema.ts`). Do not add a full-stack framework: its catch-all function would intercept requests meant for the server.

## Key directories

- `src/data/fixtures.ts`: the only stub data source. Its shapes mirror the planned tables, and health readings come from a seeded PRNG so they stay stable.
- `src/data/api.ts`: the data-access layer. Each function has a comment naming its future REST endpoint. Swap the bodies for `fetch('/api/...')` and keep the return shapes. It also holds the analytics helpers (`seriesFor`, `summarize`, `bucket`), which SQL aggregation replaces in Milestone 6.
- `src/context/session.tsx`: the demo session (role picker), replaced by JWT auth in Milestone 3.
- `src/lib/nav.ts`: sidebar config. `milestone > 1` items render `pages/Roadmap.tsx` until they are built. Set `milestone: 1` and add a route when a module ships.
- `src/components/`: `ui.tsx` (Badge, StatCard, Modal, Toast, Skeleton, EmptyState, Disclaimer, PageHeader), `charts.tsx` (TrendChart, Legend, validated series colours), `RecordForm.tsx`, `AppLayout.tsx`.
- `src/pages/`: Landing, Auth (Login/Register), Dashboard, HealthRecords, Analytics, PatientProfile, Notifications, Roadmap.

## Conventions

- Theme tokens live in `src/index.css` under `@theme` (`ink`, `canvas`, `line`, `teal-brand`, `blue-brand`, `violet-brand`, `amber-brand`, `rose-brand` and their `-soft` variants). Fonts are Bricolage Grotesque (display), Figtree (body) and JetBrains Mono (`.num` for figures).
- Reuse the `.card`, `.field`, `.btn`, `.btn-primary` and `.btn-ghost` classes.
- Chart series colours come from `SERIES` in `charts.tsx`, a CVD-validated teal/violet pair. Keep one y-axis per chart, use 2px lines, and start bar charts at zero.
- Every alert or analysis surface shows `<Disclaimer />`. Never describe output as a diagnosis or recommend medication.
- Alert thresholds are configurable data (`alertRules`), never hardcoded medical limits.
- The user asked for MySQL, then MongoDB. The project deliberately uses Netlify Database (Postgres) as its relational store, and PLAN.md explains why.
