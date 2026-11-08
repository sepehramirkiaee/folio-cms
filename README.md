# folio-cms

A portfolio site and the admin dashboard that manages it, in one Next.js app.

The public site is server-rendered from PostgreSQL for speed and SEO. The
admin is a protected dashboard for projects, experience, skills and contact
messages. The whole stack starts with one Docker command.

> Status: Phase 2 of 4. The admin is complete; the public site and demo mode
> land in Phase 3. See [Roadmap](#roadmap).

## Run locally with Docker

You only need Docker. No Node.js or PostgreSQL install, no `.env` file.

```bash
docker compose up --build
```

Then open:

- Site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>

The first start creates the database, applies migrations, seeds demo content
and prints the login in the logs:

|          |                      |
| -------- | -------------------- |
| Email    | `demo@folio-cms.dev` |
| Password | `demo-password`      |

Data lives in the `db-data` volume and survives restarts. To start over from
scratch, run `docker compose down --volumes`.

### Development with hot reload

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

The dev override runs `next dev` against the same database service with your
source bind-mounted. If you prefer Node on your machine, run only the
database in Docker:

```bash
docker compose up db -d
cp .env.example .env
npm install
npm run db:deploy && npm run db:seed
npm run dev
```

## Configuration

All configuration is environment variables. `docker-compose.yml` has safe
local defaults for every one of them.

| Variable                        | Required          | Default (local)         | Purpose                                                                |
| ------------------------------- | ----------------- | ----------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`                  | yes               | compose builds it       | PostgreSQL connection string                                           |
| `AUTH_SECRET`                   | yes               | public local value      | Signs session tokens. Generate your own: `openssl rand -base64 32`     |
| `AUTH_URL`                      | yes in production | `http://localhost:3000` | Public URL of the app                                                  |
| `DEMO_MODE`                     | no                | `false`                 | Public demo behavior (banner, prefilled login, protected demo account) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | no                | demo login              | Admin account created on first start                                   |

## Scripts

| Script                                                      | What it does                                               |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `npm run dev`                                               | Next.js dev server                                         |
| `npm run build` / `npm start`                               | Production build and server                                |
| `npm run lint`, `npm run format:check`, `npm run typecheck` | Static checks                                              |
| `npm test`                                                  | Unit and component tests (Vitest)                          |
| `npm run db:migrate`                                        | Create and apply a migration in development                |
| `npm run db:deploy`                                         | Apply pending migrations                                   |
| `npm run db:seed`                                           | Seed an empty database (`-- --reset` to wipe first)        |
| `npm run db:reset-demo`                                     | Wipe and reseed demo data. Only runs when `DEMO_MODE=true` |

## Project structure

```
src/
  app/                  routes: pages, layouts, route handlers (thin)
  features/<name>/      one folder per domain feature
    schemas/            Zod schemas, shared by forms and route handlers
    server/             server-only data access, the only code that touches Prisma
    api/                client fetchers and queryKey factory
    hooks/              TanStack Query hooks
    components/         feature UI
  components/ui/        shadcn/ui primitives
  components/layout/    admin shell and navigation
  lib/                  db client, auth, env validation, helpers
  stores/               Zustand stores, UI state only
  test/                 Vitest setup and MSW handlers
prisma/                 schema, migrations, seed data
scripts/                seed-if-empty (container start), reset-demo (cron)
docker/                 container entrypoint
```

Admin data flows from a TanStack Query hook, through a typed fetcher, to a
route handler in `app/api/admin` that validates input with the feature's Zod
schema and calls the feature's server module. Public pages call the server
module directly from server components. [CLAUDE.md](CLAUDE.md) has the full set
of conventions.

## Tech stack

Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict),
Tailwind CSS v4, shadcn/ui, Prisma 7 with PostgreSQL, Auth.js v5, TanStack
Query, Zustand, React Hook Form, Zod, Vitest, Testing Library, MSW, Playwright,
GitHub Actions.

A few choices worth explaining:

- **Auth.js v5 is still a beta release.** It is pinned to an exact version and
  only its Credentials provider and JWT sessions are used, which keeps the
  surface small.
- **TypeScript 6, not 7.** typescript-eslint does not support TypeScript 7 yet.
- **No tsx or build step for scripts.** The seed and reset scripts run on
  Node's native TypeScript support, so the production image runs them as is.
- **Passwords use Node's built-in scrypt**, so there is no native bcrypt dependency.

## Roadmap

- [x] Phase 1: tooling, CI, Docker, database schema and seed, admin login
- [x] Phase 2: admin CRUD for projects, experience and skills, reorder, inbox, dashboard
- [ ] Phase 3: public site, contact form, demo mode
- [ ] Phase 4: e2e and accessibility tests, docs polish

## How this was built

This project is built with an AI coding agent (Claude) working under the
conventions in [CLAUDE.md](CLAUDE.md), in phases that each end with a human
review before the next one starts. A full account of what the agent did and
what was decided by hand follows in Phase 4.
