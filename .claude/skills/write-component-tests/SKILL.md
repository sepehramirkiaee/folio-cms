---
name: write-component-tests
description: Write Vitest and Testing Library tests for folio-cms components, forms and TanStack Query hooks, with MSW for the network. Use when adding or changing a form, a hook with an optimistic update, or any component with behavior worth protecting.
---

# Write component and hook tests

Tests describe behavior a user or a caller can observe. They do not assert on
internal state, class names or how many times something rendered.

## What to test, by kind of code

| Code                              | Test                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Zod schema                        | Valid input passes; each rule fails with its exact message and path; empty-string and null handling      |
| Form                              | Validation messages before any request; the exact JSON body sent; server field errors shown on the field |
| Query hook with optimistic update | The cache changes before the server answers; it rolls back on error                                      |
| Pure helper                       | Table-driven cases with `it.each`                                                                        |
| Server module                     | Not here. Server modules are covered by the e2e suite against a real database                            |

## Rules

1. **Render with `renderWithQuery`** from `src/test/utils/render.tsx` for
   anything that uses TanStack Query. It creates a fresh client per test with
   retries off, so tests never share cache or wait on retries.
2. **Mock the network, not the hooks.** Use `server.use(http.post("*/api/..."))`
   from MSW. Unhandled requests fail the test (`onUnhandledFrame: "error"`), so
   every request a test makes is declared in that test.
3. **Query like a user.** `getByRole(role, { name })` first, then
   `getByLabelText`. Avoid `getByTestId`. If a query is ambiguous, the UI
   probably has two controls with the same accessible name: fix the UI.
4. **Drive input with `userEvent.setup()`**, never `fireEvent`, so focus, typing
   and pointer events behave like a browser.
5. **Assert accessibility outcomes**: `aria-invalid` on invalid fields, focus
   moving to the first invalid field or to a confirmation, live regions
   (`role="status"`) containing the message.
6. **Optimistic updates need a slow response.** Add `await delay(200)` in the
   MSW handler so the optimistic state is observable before the server
   answers. Seed the cache with `queryClient.setQueryData` first.
7. **Radix in jsdom** (Select, Dialog, Switch) relies on the shims in
   `src/test/setup.ts`. Open a Select with
   `user.click(getByRole("combobox", { name }))`, then click the `option`.
8. **No arbitrary timers.** Wait with `findBy...` or `vi.waitFor`. For debounce
   logic use `vi.useFakeTimers()` and advance time explicitly.
9. **Never mock what the test is about.** Mock `next/navigation` or a server
   action only when the component under test merely calls it.

## Template: form test

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { renderWithQuery } from "@/test/utils/render";

describe("ThingForm", () => {
  it("validates before sending anything", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ThingForm onDone={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Add thing" }));
    expect(await screen.findByText("Enter a name")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
  });

  it("sends the parsed values", async () => {
    let body: unknown;
    server.use(
      http.post("*/api/admin/things", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { id: "t1", name: "A" } });
      }),
    );
    // ...fill, submit, then:
    expect(body).toEqual({ name: "A" });
  });
});
```

Real examples to copy: `src/features/skills/components/skill-form.test.tsx`,
`src/features/projects/hooks/use-reorder-projects.test.tsx`,
`src/features/contact/components/contact-form.test.tsx`.

## Finish

`npm test` must pass three runs in a row (`for i in 1 2 3; do npm test; done`)
before committing, which catches timing-dependent tests early.
