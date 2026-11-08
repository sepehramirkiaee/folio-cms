---
name: add-crud-feature
description: Add a new admin CRUD feature to folio-cms end to end (Zod schemas, server module, route handlers, query keys, TanStack Query hooks, table, form, tests). Use when adding a new content type to the admin, or extending an existing one with list, create, edit or delete.
---

# Add a CRUD feature

Follow these steps in order. Each step names the file to create and the
existing feature to copy from. `skills` is the smallest complete example,
`projects` shows relations and reordering.

## 0. Before you start

- Read `CLAUDE.md`. The data-flow and accessibility rules apply to every file below.
- Decide the sortable columns and the filters for the list. They become part
  of the list query schema, so they must be known up front.
- If the Prisma model changes, run `npm run db:migrate -- --name <change>` and
  commit the migration in its own `feat(db):` commit first.

## 1. Schemas: `src/features/<name>/schemas/<name>.ts`

One file, imported by both the form and the route handlers.

- `<name>InputSchema`: the create/update body. Use `z.string().trim()`, explicit
  max lengths matching the database, and human error messages ("Enter a title").
- Optional text fields: transform `""` to `null` so forms can send empty inputs.
- `<name>ListParamsSchema = listParamsSchema([...sortable], defaultSort).extend({ ...filters })`.
- Export inferred types: `type XInput = z.input<...>` for form values,
  `z.output<...>` for parsed data, and the row type the API returns.

## 2. Server module: `src/features/<name>/server/<name>.ts`

- Starts with `import "server-only"`. The only file that imports `getDb()`.
- `list(params)`: build `where` from `q` and filters, `orderBy` from the
  whitelisted sort field, run `findMany` and `count` in one `$transaction`,
  return `paginate(items, total, page, pageSize)`.
- `get(id)`, `create(input)`, `update(id, input)`, `remove(id)`. Throw
  `ApiError.notFound("<Thing>")` when a row is missing. Unique violations are
  mapped to 409 field errors by `withAdmin`, so do not pre-check them.
- `select` only the fields the admin shows. Never return `passwordHash`-like data.

## 3. Route handlers: `src/app/api/admin/<name>/route.ts` and `[id]/route.ts`

Thin: parse, call the server module, return.

```ts
export const GET = withAdmin(async (req) => list(parseQuery(req, xListParamsSchema)));
export const POST = withAdmin(async (req) => create(await parseBody(req, xInputSchema)));
```

For `[id]` routes type the context with `RouteContext<"/api/admin/<name>/[id]">`
and `await ctx.params`.

## 4. Client API and keys: `src/features/<name>/api/<name>.ts`

- A queryKey factory: `all`, `lists()`, `list(params)`, `details()`, `detail(id)`.
- Fetchers built on `apiFetch`, with `toSearchParams(params)` for lists.

## 5. Hooks: `src/features/<name>/hooks/use-<name>.ts`

- `useXList(params)` with `placeholderData: keepPreviousData`.
- `useX(id)`, `useCreateX`, `useUpdateX`, `useDeleteX`.
- Mutations invalidate `keys.lists()` and set or invalidate `keys.detail(id)`.
  Also invalidate `dashboardKeys.all` when counts change.
- Toasts on success live in the component, not the hook, so hooks stay reusable.

## 6. Components: `src/features/<name>/components/`

- `<name>-table.tsx`: columns from `serverColumnHelper<Row>()` at module scope,
  `useTableView("<name>", defaults)` for view state, `useServerTable`,
  `DataTable`, `DataTableSearch`, `DataTablePagination`. Row actions are a
  dropdown with an accessible label that includes the row name.
- `<name>-form.tsx`: React Hook Form with `zodResolver(xInputSchema)`, shadcn
  `Field` components, `aria-invalid` plus `aria-describedby` on every input,
  `applyServerErrors` in `onError` of the mutation.
- Delete uses `ConfirmDialog` and names the item being deleted.

## 7. Pages: `src/app/admin/(protected)/<name>/`

`page.tsx` (list), `new/page.tsx`, `[id]/page.tsx`. Pages are thin server
components that set `metadata` and render the feature component. Add the nav
item in `src/components/layout/admin/nav-items.ts`.

- Small entities with a few fields (skills) edit in a dialog on the list page
  instead of separate pages.
- `[id]` pages must read `params` inside a `<Suspense>` boundary (see
  `projects/[id]/page.tsx`). Cache Components treats params as URL data, and
  reading it outside a boundary breaks instant navigation.
- Long forms use `useFormDraft(form, "<name>:<id or new>")` so unsaved input
  survives a reload, and clear it on a successful save.

## 8. Tests (same commit as the code they cover)

- Schema tests: valid input, each validation message, empty-string handling.
- Form test with Testing Library: shows field errors, submits parsed values,
  shows server field errors (mock the mutation with MSW, not by mocking hooks).
  Render with `renderWithQuery` from `src/test/utils/render.tsx`.
- Query inputs by role and accessible name. If a query is ambiguous, the UI
  probably has two controls with the same name, which is an accessibility
  bug worth fixing rather than working around in the test.
- Hook test for any optimistic update: success path and rollback on error.

## 9. Finish

Run, without pipes: `npm run lint`, `npm run format:check`, `npm run typecheck`,
`npm test`. Then click through the feature with the keyboard only: tab order,
focus after dialogs close, visible focus rings, error announcements. Commit as
`feat(<name>): ...` with a body that lists what the feature does.
