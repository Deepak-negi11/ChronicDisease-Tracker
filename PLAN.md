# AI-Based Chronic Disease Tracker: Product Roadmap

The tracker is a relational, DBMS-driven health-tracking and analytics platform for patients with long-term conditions, their doctors and administrators. Alerts and reports are rule-based and informational. The product never diagnoses.

## Platform decisions

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + React Router + Recharts (Vite SPA). Live now.
- **Backend:** Express.js REST API (TypeScript), deployed as a **Netlify Server** (`netlify/server/index.mjs` entry, with source in `server/`: `routes/`, `controllers/`, `services/`, `middleware/`, `validators/`, `config/`, `database/`). Every API call goes to `/api/*` on the same origin.
- **Database:** **Netlify Database**, a managed Postgres instance provisioned with the site. The brief asked for MySQL 8.x and then, in a final note, MongoDB. The project uses the relational database the hosting platform manages. Postgres supports every DBMS concept in the brief (PK/FK, UNIQUE, NOT NULL, CHECK, DEFAULT, 3NF, joins, aggregates, GROUP BY/HAVING, subqueries, B-tree indexes, `BEGIN/COMMIT/ROLLBACK`, parameterised queries, `EXPLAIN ANALYZE`). A document store such as MongoDB would rule out most of them.
  - Schema in `db/schema.ts` (Drizzle ORM via `@netlify/database`). Migrations are generated as plain `.sql` files, which double as the readable "SQL schema file" for evaluation.
  - Analytical and report queries are written as explicit **parameterised SQL** (Drizzle `sql` template), so the joins, aggregates and subqueries are visible in code.
- **Auth:** bcrypt password hashing + JWT (short-lived access token, httpOnly refresh cookie), with role-based middleware (`patient`, `doctor`, `admin`) on every route.

## Milestones

### 1. Product surface ✅ (done)
Branded landing page, sign-in/registration, responsive app shell with a role-aware sidebar, and five working screens that run on stub data from `src/data/fixtures.ts`:
- **Dashboard:** six KPI tiles, BP trend, recent alerts, metric snapshot, recent records, upcoming appointments, quick navigation.
- **Health records:** filter by metric and date range, sort, paginate, add, edit and delete, with symptom tagging and validation.
- **Analytics:** six metrics, 7/30/90/120-day ranges, daily/weekly/monthly grouping, average/min/max, trend direction, comparison with the previous period, threshold lines, and a table view.
- **Patient profile:** conditions, prescriptions, appointments, glucose trend and a timeline of the health history.
- **Notifications:** unread/read/resolved workflow and a list of active alert rules.

The remaining modules appear in the navigation as roadmap pages.

### 2. Data model, seed data and server foundation
- `db/schema.ts`: USERS, PATIENT (1:1 with USERS), DOCTOR (1:1 with USERS), DISEASE, PATIENT_DISEASES, HEALTH_METRICS, HEALTH_RECORD, SYMPTOM, RECORD_SYMPTOMS, MEDICATION, DISEASE_MEDICATIONS, PRESCRIPTION, SIDE_EFFECT, SYMPTOM_SIDE_EFFECTS, APPOINTMENT, AI_ANALYSIS_REPORT, ALERTS. Two supporting tables: **ALERT_RULES** for configurable thresholds and **DOCTOR_PATIENT_ACCESS** for authorisation. An **AUDIT_LOG** table records important changes.
- Constraints: CHECK (value ranges, `end_date >= start_date`, enum statuses), UNIQUE (email, junction pairs), DEFAULTs (`created_at`, `status`), FK rules (CASCADE from patient to their records, RESTRICT on master data in use, SET NULL on `alerts.record_id`).
- Indexes: `(patient_id, recorded_at)`, `(patient_id, metric_id, recorded_at)`, `alerts(patient_id, status)`, `appointment(doctor_id, date)`.
- Seed script that mirrors the current fixtures: 6 patients, 4 doctors, about 120 days of readings, prescriptions, appointments, side effects and alerts.
- Express Netlify Server skeleton with centralised error handling, request validation and CORS.

### 3. Authentication and role-based access
- `/api/auth/register` (USERS + PATIENT inserted in one transaction), `/login`, `/refresh`, `/logout`.
- `requireAuth`, `requireRole`, and `canAccessPatient` middleware. A patient sees only their own record. A doctor sees only patients in DOCTOR_PATIENT_ACCESS.
- Replace `src/context/session.tsx` with real auth, and build the **Settings** page (profile, password change; admins also manage users and roles).

### 4. Core clinical data APIs
- Patients (CRUD, search, safe delete), Diseases (CRUD, filters, assign to patient), Health metrics, Health records (CRUD, date/metric filters), Symptoms.
- Point `src/data/api.ts` at the real endpoints. The Dashboard, Health records and Profile screens then work unchanged.
- Build the **Patients**, **Diseases** and **Symptoms** screens.
- Record creation runs in one transaction: INSERT the record, INSERT its symptoms, evaluate the rules, INSERT any alerts, then COMMIT, or ROLLBACK if any step fails.

### 5. Treatment and scheduling
- Medications + DISEASE_MEDICATIONS, Prescriptions (active vs completed, history), Side effects + SYMPTOM_SIDE_EFFECTS (patient-reported effects kept apart from confirmed reactions), Doctors, Appointments (book, reschedule, cancel, with calendar and table views).
- Nothing is recommended or prescribed automatically.

### 6. Analytics, reports and alerts on SQL
- Analytics endpoints that use `AVG/MIN/MAX/COUNT … GROUP BY date_trunc('week'|'month')` with HAVING, plus previous-period comparison through subqueries.
- **Analysis reports:** generate a report for a chosen period (rule-based summary, trends, observations and "discuss with your doctor" points), then save it to AI_ANALYSIS_REPORT and view it later.
- Optional AI-written summary through Netlify AI Gateway, clearly labelled and built only from stored values. It never fills in missing data.
- Alert-rule editor for doctors and admins.

### 7. Hardening and evaluation pack
- Test the API for data isolation, validation, FK behaviour and transaction rollback.
- Write `docs/dbms-concepts.md`, mapping each DBMS concept to a file or query with `EXPLAIN ANALYZE` output, and `docs/api.md` with the endpoint reference.
- Add an audit-log viewer for admins, and a demo script for the project viva.
