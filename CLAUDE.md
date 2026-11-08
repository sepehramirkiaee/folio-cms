# CLAUDE.md

Conventions for AI agents (and humans) working in this repository. Read this
before changing code. If a rule here blocks you, stop and ask instead of
working around it.

## What this is

folio-cms is a portfolio site plus an admin dashboard in one Next.js App
Router app, backed by PostgreSQL through Prisma. Recruiters and reviewers read
this code, so clarity and consistency matter more than cleverness.

## Commands

| Task                     | Command                                                     |
| ------------------------ | ----------------------------------------------------------- |
| Dev server               | `npm run dev` (needs Postgres, see README)                  |
| Lint, format, types      | `npm run lint`, `npm run format:check`, `npm run typecheck` |
| Unit and component tests | `npm test`                                                  |
| Production build         | `npm run build`                                             |
| New migration            | `npm run db:migrate -- --name <change>`                     |
| Seed / reset demo        | `npm run db:seed`, `npm run db:reset-demo`                  |
| Full stack in Docker     | `docker compose up --build`                                 |

Before every commit: lint, format check, typecheck and tests must pass. Run
them with `set -o pipefail` or without pipes, so a failure is not hidden.

## Stack and the job of each library

Do not add a dependency that is not on this list without asking first.

- **Next.js 16 (App Router, Cache Components)**: routing, server rendering, route handlers.
- **Prisma 7 + `@prisma/adapter-pg`**: database access and migrations.
- **Auth.js v5 (beta, pinned)**: admin login with the Credentials provider and JWT sessions.
- **Zod**: every schema. Forms and route handlers import the same schema.
- **TanStack Query**: all server state in the admin. Nothing else fetches admin data.
- **Zustand**: UI state only (theme, sidebar, table filters, unsaved drafts). Never server data.
- **React Hook Form + `@hookform/resolvers`**: every form, validated with the shared Zod schema.
- **TanStack Table**: admin list tables. **dnd-kit**: drag to reorder.
- **shadcn/ui** (copied into `src/components/ui`) on Radix, styled with Tailwind v4.
- **Vitest + Testing Library + MSW**: unit, component and hook tests. **Playwright + axe**: e2e and accessibility.

## Folder structure

```
src/
  app/                    routes only: pages, layouts, route handlers. Thin.
  features/<name>/
    schemas/              Zod schemas and inferred types. Shared by client and server.
    server/               "server-only" data access and server actions. Only place that touches Prisma.
    api/                  client fetchers and the queryKey factory for the feature
    hooks/                TanStack Query hooks (queries and mutations)
    components/           feature UI
  components/ui/          shadcn primitives, edited only for theming or accessibility
  components/layout/      shells, headers, navigation
  lib/                    cross-cutting helpers (db, auth, env, api handler, utils)
  stores/                 Zustand stores (UI state only)
  test/                   test setup and MSW handlers
prisma/                   schema, migrations, seed data
scripts/                  operational scripts (seed-if-empty, reset-demo)
```

## Rules

**Data flow**

- Admin pages are client components that read and write through TanStack Query hooks.
- Hooks call fetchers in `features/<name>/api`, which call typed route handlers in `app/api/admin/...`.
- Route handlers validate input with the feature's Zod schema and call `features/<name>/server`.
- Public pages are server components that call `features/<name>/server` directly.
- Every feature has a queryKey factory (`projectKeys.all`, `.list(params)`, `.detail(id)`).
  Mutations invalidate the narrowest keys that changed. Reordering uses an optimistic update
  with rollback on error.

**Security**

- `proxy.ts` is only the first check. Every admin route handler and layout verifies the session again.
- Never trust client input: parse with Zod in the handler, even if the form already validated.
- No secrets in the repo. New settings go into `.env.example`, `docker-compose.yml` defaults and `src/lib/env.ts`.

**TypeScript**

- Strict mode, no `any`, no non-null assertions to silence errors. Types come from Zod (`z.infer`) or Prisma.
- Code reachable from `scripts/` or `prisma/` runs on Node's native type stripping: use relative
  imports with `.ts` extensions there and no enums or other non-erasable syntax.

**Next.js 16 specifics**

- Cache Components is on. Request data (`cookies`, `headers`, `searchParams`, session) must be read
  inside a `<Suspense>` boundary. Uncached database reads in route handlers call `await connection()` first.
- The middleware file is `src/proxy.ts`.

**Accessibility (not optional)**

- Semantic HTML first. One `h1` per page. Landmarks: `header`, `nav`, `main`.
- Every input has a visible label. Errors use `aria-invalid` and `aria-describedby`.
- Everything works with the keyboard and shows a visible focus ring.
- Text contrast meets WCAG AA in light and dark themes. Respect `prefers-reduced-motion`.

**Writing style**

- No em dashes anywhere (code comments, UI copy, docs). Use commas or periods.
- Comments explain why, not what.

**Commits**

- Small and focused, conventional messages: `feat(scope):`, `fix:`, `test:`, `docs:`, `refactor:`, `build:`, `ci:`, `chore:`.
- One logical change per commit, with its tests. Never commit failing checks.
