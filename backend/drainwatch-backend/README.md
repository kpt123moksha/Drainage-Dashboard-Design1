# DrainWatch Backend (SQLite + Direct SQL)

This backend uses Node.js, Express, SQLite and `better-sqlite3`. It does not use PostgreSQL or Prisma.

## Requirements
- Node.js 20 or newer
- npm

## Setup
1. Open a terminal in `backend/`.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`.
4. Set `JWT_SECRET` to a random secret of at least 32 characters.
5. Run migrations: `npm run migrate`
6. Seed demo data: `npm run seed`
7. Start development server: `npm run dev`

Health endpoint: `http://localhost:5000/api/v1/health`

## Demo accounts
The seed script creates development-only accounts:
- Admin: `admin@drainwatch.local` / `AdminDemo!2026`
- Citizen: `citizen@drainwatch.local` / `CitizenDemo!2026`
- Employee: `employee@drainwatch.local` / `EmployeeDemo!2026`

Change or remove these accounts before any public deployment. Demo accounts are not intended for production.

## Frontend
Set the frontend's API base URL to `http://localhost:5000/api/v1`. Send the login token as `Authorization: Bearer <token>`.

Example:
```js
const response = await fetch("http://localhost:5000/api/v1/complaints", {
  headers: { Authorization: `Bearer ${token}` }
});
const result = await response.json();
```

## Main endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/complaints`
- `GET /api/v1/complaints`
- `GET /api/v1/complaints/:id`
- `PATCH /api/v1/complaints/:id/status`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id/status`
- `POST /api/v1/tasks/:id/evidence`
- `POST /api/v1/tasks/:id/acknowledgement`
- `GET /api/v1/drains`
- `POST /api/v1/drains`
- `POST /api/v1/drains/:id/risk-assessments`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/employees/pending`
- `POST /api/v1/admin/employees/:id/decision`
- `GET /api/v1/admin/deadline-rules`
- `PUT /api/v1/admin/deadline-rules/:id`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/notifications`

## SQL
The schema and views are in `sql/migrations/001_initial_schema.sql`.
The demonstration query collection is in `../database/queries.sql`.

Run `npm run sql:demo` from the backend directory to execute the query collection.

## Tests
Run `npm test`. Tests use a separate temporary SQLite database.

## Important prototype limitations
- The API accepts image URLs in evidence endpoints. Upload middleware and image storage integration still need to be added before actual image upload is available.
- Authentication uses bearer tokens. A production deployment should review token storage, rotation, revocation, CSRF considerations if switching to cookies, and secret management.
- Risk scoring is a transparent demonstration formula, not a validated flood prediction.
- Deadline rules are configurable data; scheduled reminder delivery is not implemented.
- SQLite is suitable for the local mini-project. Multiple computers do not automatically share one local database file.
- Audit logs have SQLite triggers preventing ordinary updates/deletes, but this is not tamper-proof against someone who can modify the database file directly.
