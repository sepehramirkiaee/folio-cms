---
name: a11y-review
description: Review a folio-cms page or component for accessibility (WCAG 2.1 AA) with automated axe checks plus the manual keyboard and screen reader checks axe cannot do. Use before committing any new page, dialog, form or interactive component.
---

# Accessibility review

axe catches roughly a third of real issues. The rest are found by using the
page with a keyboard and by reading the accessibility tree. Do all three steps.

## 1. Automated: axe in Playwright

Add the page to `e2e/accessibility.spec.ts` (public or admin list). The spec
runs `expectNoA11yViolations` from `e2e/fixtures.ts` with the WCAG 2.1 A and AA
rules, in light and in dark mode. For a dialog or menu, open it first and run
the check while it is open.

```bash
npm run build && npm run test:e2e -- e2e/accessibility.spec.ts
```

Wait for client data before checking (no `aria-busy="true"` left), or axe
only sees skeletons.

## 2. Keyboard walkthrough

With the mouse untouched, from the address bar:

- [ ] The first Tab reaches "Skip to content", and it moves focus to `main`.
- [ ] Every stop shows a visible focus ring, in both themes. Watch for
      focusable containers (Radix tab panels, scroll areas) with no outline.
- [ ] Focus order follows the visual order. No focus lands on hidden or
      off-screen elements (the contact honeypot must be skipped).
- [ ] Every action works with Enter or Space: menus, selects, switches,
      checkboxes, drag handles (Space, arrow keys, Space; Escape cancels).
- [ ] Dialogs trap focus, close with Escape, and return focus to the button
      that opened them.
- [ ] After submitting a form with errors, focus goes to the first invalid field.
      After a success that replaces the form, focus moves to the confirmation.

A quick automated version of this pass: tab through the page in Playwright
and log, for each stop, the element and whether `outline` or `box-shadow` is
set while focused. Any stop without one needs a `focus-visible` style.

## 3. Names, roles and states

Read the page through `getByRole` queries or the browser's accessibility tree:

- [ ] One `h1` per page, headings in order, landmarks `header`, `nav`, `main`.
- [ ] Icon-only buttons have an `aria-label` that names the target:
      "Actions for Atlas design system", not "Actions".
- [ ] Every input has a visible `<label>`. Errors use `aria-invalid` and are
      linked with `aria-describedby`. Placeholders are never the only label.
- [ ] State is not color alone: unread messages are bold, have a dot and a
      visually hidden "(unread)"; the current nav item has `aria-current="page"`.
- [ ] Sortable table headers are buttons, and the `th` has `aria-sort`.
- [ ] Async updates are announced: toasts, `role="status"` confirmations,
      dnd-kit announcements while reordering.
- [ ] Decorative icons have `aria-hidden`; meaningful ones (the featured star)
      have a label.

## 4. Visual

- [ ] Text contrast 4.5:1, large text and UI parts 3:1, in light and dark.
      Muted text uses `text-muted-foreground`, which is tuned for AA.
- [ ] Usable at 320px wide and at 200% zoom without horizontal scrolling,
      except data tables, which scroll inside their own container.
- [ ] Animations respect `prefers-reduced-motion` (handled globally in
      `globals.css`; do not add motion that bypasses it).

## Report

List findings as `WCAG criterion: problem, where, fix`, fix them in a
`fix(a11y):` commit, and add an e2e assertion when the issue could come back.
