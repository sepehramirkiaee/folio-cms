# folio-cms

[![CI](https://github.com/sepehramirkiaee/folio-cms/actions/workflows/ci.yml/badge.svg)](https://github.com/sepehramirkiaee/folio-cms/actions/workflows/ci.yml)

A portfolio site and the admin dashboard that manages it, in one Next.js app.

The public site is server-rendered from PostgreSQL for speed and SEO. The
admin is a protected dashboard for projects, experience, skills and contact
messages. The whole stack starts with one Docker command.

## What it does

**Public site**

- Home page with an intro, selected work, an experience timeline, skills grouped
  by category and a contact form
- A page per project with the case study, links and the skills used
- Only published projects are reachable; drafts show the not found page
- Page titles, Open Graph data, `sitemap.xml`, `robots.txt` and Person
  structured data
- Light and dark mode, responsive from 320px up

**Admin** (at `/admin`)

- Sign in and out, with every admin page and API route protected twice
- Dashboard with counts, the latest messages and an unread badge in the sidebar
- Projects, experience and skills: tables that sort, filter, search and page
  on the server, and create and edit forms validated with shared Zod schemas
- Drag-to-reorder projects with the mouse or the keyboard, saved with an
  optimistic update that rolls back if the server rejects it
- Inbox: open, mark read or unread, reply by email, delete
- Profile settings for the home page intro
- Unsaved project and experience edits survive a reload as restorable drafts

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

## Deploy your own

folio-cms is one Docker image plus PostgreSQL, configured only through
environment variables. Any host that runs a container works (a VPS with
Docker Compose, Fly.io, Railway, Render), with any hosted Postgres.

1. Create a PostgreSQL database and note its connection string.
2. Build the image from this repository (`docker build -t folio-cms .`) or let
   your host build it from the Dockerfile.
3. Run it with these variables:

   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/folio"
   AUTH_SECRET="$(openssl rand -base64 32)"
   AUTH_URL="https://your-domain.com"
   ADMIN_EMAIL="you@example.com"        # first-start admin account
   ADMIN_PASSWORD="a-long-password"
   ```

4. On start the container applies migrations, creates the admin account and
   demo content if the database is empty, and serves on port 3000. Put it
   behind your host's HTTPS proxy, then replace the demo content in the admin.

To use the bundled `docker-compose.yml` on a server, set the same variables in
a `.env` file next to it and run `docker compose up -d --build`.

### Running a public demo

Set `DEMO_MODE=true` to turn a deployment into a public demo:

- A banner on every page says it is a demo that resets nightly.
- The sign-in page shows and prefills the demo login.
- Each table has a row limit, so visitors cannot flood the shared demo.
- The contact form warns that messages are visible to other demo visitors.
- There is no user management in the app, so the demo account itself cannot
  be changed or deleted from the browser.

Reset the content every night with a cron job on the host:

```cron
# Every day at 03:00, wipe and reseed the demo content
0 3 * * * cd /srv/folio-cms && docker compose exec -T app node scripts/reset-demo.ts
```

Outside Docker the same reset is `npm run db:reset-demo`. Both refuse to run
unless `DEMO_MODE=true`, so they cannot wipe a real portfolio by accident.

## Configuration

All configuration is environment variables. `docker-compose.yml` has safe
local defaults for every one of them.

| Variable                        | Required          | Default (local)         | Purpose                                                            |
| ------------------------------- | ----------------- | ----------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`                  | yes               | compose builds it       | PostgreSQL connection string                                       |
| `AUTH_SECRET`                   | yes               | public local value      | Signs session tokens. Generate your own: `openssl rand -base64 32` |
| `AUTH_URL`                      | yes in production | `http://localhost:3000` | Public URL of the app, also used for the sitemap                   |
| `DEMO_MODE`                     | no                | `false`                 | Public demo behavior: banner, prefilled login, row limits          |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | no                | demo login              | Admin account created on first start                               |

The server validates these on start (`src/lib/env.ts`) and fails with a list
of what is wrong, instead of failing on the first request.

## Scripts

| Script                                                      | What it does                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                                               | Next.js dev server                                               |
| `npm run build` / `npm start`                               | Production build, then the standalone server the image also runs |
| `npm run lint`, `npm run format:check`, `npm run typecheck` | Static checks                                                    |
| `npm test`                                                  | Unit, component and hook tests (Vitest)                          |
| `npm run test:e2e`                                          | Playwright user flows and axe checks (after `npm run build`)     |
| `npm run db:migrate`                                        | Create and apply a migration in development                      |
| `npm run db:deploy`                                         | Apply pending migrations                                         |
| `npm run db:seed`                                           | Seed an empty database (`-- --reset` to wipe first)              |
| `npm run db:reset-demo`                                     | Wipe and reseed demo data. Only runs when `DEMO_MODE=true`       |

## Testing

| Layer                | Tool                                    | What it covers                                                                    |
| -------------------- | --------------------------------------- | --------------------------------------------------------------------------------- |
| Schemas and helpers  | Vitest                                  | Validation messages, slugs, password hashing, rate limiting, demo limits          |
| Components and hooks | Vitest, Testing Library, MSW            | Forms (client and server errors), optimistic reorder and read state with rollback |
| User flows           | Playwright against a production build   | Sign in and out, publishing, keyboard reorder, inbox, contact form, 404s          |
| Accessibility        | Playwright with axe (WCAG 2.1 A and AA) | Every public and admin page and a dialog, in light and dark mode                  |
| Database             | CI with Postgres                        | Migrations apply to an empty database and match `schema.prisma` exactly           |
| Docker               | CI                                      | `docker compose up --build` from scratch, health, seed, restart                   |

GitHub Actions runs all of it on every push. Run the end-to-end suite locally
with Postgres running:

```bash
npm run build
npm run test:e2e
```

## Project structure

```
src/
  app/                  routes: pages, layouts, route handlers (thin)
    (public)/           the portfolio: home and project pages
    admin/              login, and the protected admin under (protected)/
    api/admin/          typed JSON API for the admin
    api/contact/        public endpoint for the contact form
  features/<name>/      one folder per domain feature
    schemas/            Zod schemas, shared by forms and route handlers
    server/             server-only data access, the only code that touches Prisma
    api/                client fetchers and the queryKey factory
    hooks/              TanStack Query hooks
    components/         feature UI
  components/ui/        shadcn/ui primitives
  components/layout/    admin shell, public header and footer
  lib/                  db client, auth, env validation, API helpers
  stores/               Zustand stores, UI state only
  test/                 Vitest setup, MSW server, render helpers
e2e/                    Playwright specs and the axe helper
prisma/                 schema, migrations, seed data
scripts/                seed-if-empty (container start), reset-demo (cron)
docker/                 container entrypoint
.claude/skills/         procedures the AI agent follows (see below)
```

### How data flows

```
Admin (client)                                    Public site (server)
  component                                         page (server component)
    -> TanStack Query hook (keys, optimistic)         -> features/<name>/server
      -> features/<name>/api (typed apiFetch)            -> Prisma -> Postgres
        -> app/api/admin/... (withAdmin, Zod)
          -> features/<name>/server -> Prisma -> Postgres
```

- **One schema per feature.** The form's `zodResolver` and the route
  handler's `parseBody` import the same Zod schema, and TypeScript types are
  inferred from it.
- **One query layer.** `features/<name>/server` is the only code that talks to
  the database. Public pages call it directly; the admin reaches it through
  route handlers.
- **Errors have one shape.** `withAdmin` turns Zod errors into 422 with field
  errors, unique conflicts into 409 on the right field, and anything else into
  a generic 500. Forms show field errors on the field.
- **Server state vs UI state.** TanStack Query owns everything that comes from
  the API. Zustand only holds UI state: theme, sidebar, table views and
  unsaved drafts.
- **Auth is checked twice.** `src/proxy.ts` redirects or returns 401 early,
  and every admin layout and route handler checks the session again.

## Data model

```
User            admin accounts (JWT sessions, so no session tables)
Profile         one row: the home page intro and contact links
Project  *--*   Skill          projects tag the skills they used
Experience *--* Skill          roles tag the skills they used
ContactMessage  messages from the public form, with read state
```

Projects have a `status` (draft or published), a `featured` flag and a manual
`sortOrder`. Experience dates are stored as the first day of the month, since
a CV never needs the day. Indexes match the admin's filters and sorts.

## Decisions and trade-offs

- **Next.js 16 with Cache Components.** Public pages read the database at
  request time inside Suspense, so admin edits show immediately and the image
  builds without a database. The static shell (header, footer) is still
  prerendered.
- **Not found pages return status 200.** Project pages stream, so an unknown
  or unpublished slug renders the not found page after the status is sent. The
  page carries `noindex`, so search engines skip it.
- **Auth.js v5 is still a beta release.** It is pinned to an exact version and
  only its Credentials provider and JWT sessions are used.
- **TypeScript 6, not 7.** typescript-eslint does not support TypeScript 7 yet.
- **Prisma 7.10, not 8.** npm's `latest` tag for Prisma points to an 8.0
  release candidate.
- **No tsx or build step for scripts.** The seed and reset scripts run on
  Node's native TypeScript support, so the production image runs them as is.
- **Passwords use Node's built-in scrypt**, so there is no native bcrypt dependency.
- **The image includes the Prisma CLI** (about 220MB) because the app container
  itself runs `prisma migrate deploy` on start. A separate one-off migration
  container would halve the image size.
- **The contact form rate limit is in memory**, which is right for one
  container. Several instances would need a shared store.
- **System fonts.** No web font dependency and no network access at build time.

## How this was built

This project was built by an AI coding agent (Claude, working through Claude
Code) from a written brief, in four phases. Each phase ended with all checks
passing, a report, and a human review and approval before the next phase
started.

**Decided by hand (the brief and the reviews)**

- The product, the MVP scope and what stays out of it
- The whole stack, and the rule that no library is added without approval
- Architecture rules: typed route handlers for the admin, TanStack Query for
  all server state, Zustand for UI state only, shared Zod schemas, server
  rendering for public pages, feature folders
- Accessibility, responsiveness and "no secrets in the repo" as requirements
- The Docker requirements, including one-command startup and the demo mode
- The phased workflow, small conventional commits and checks after each phase
- In the plan review: the extra libraries the stack needs, a profile editor,
  the demo mode policy, writing tests alongside features, npm, and keeping
  Auth.js despite its beta status

**Done by the agent**

- Proposed the folder structure, Prisma schema, API routes and Docker setup
  for review before writing code
- Wrote the code, tests, migrations, seed content, Docker files, CI and docs
- Checked current versions of every library instead of relying on memory, and
  flagged the cases above where "latest" was not usable
- Verified every feature in a real browser, in both themes and at phone
  width, and ran the production build without a database
- Followed the conventions in [CLAUDE.md](CLAUDE.md), and wrote down repeatable
  procedures as skills in [`.claude/skills/`](.claude/skills):
  - `add-crud-feature`: the recipe used for every admin feature, written before
    the first one and updated with what each feature taught
  - `write-component-tests`: the testing patterns used across the repo
  - `a11y-review`: automated and manual accessibility checks for new UI

Every commit was checked on its own (types and formatting) before pushing, so
the history can be bisected.

## Nice to have, not built

- Markdown or rich text for case studies (currently plain text paragraphs)
- Image uploads (covers are URLs today)
- Rate limiting on sign in
- Email notification for new messages
- More than one admin account, with user management
- An audit log of admin changes
- A separate migration container for a smaller image
- Translations
