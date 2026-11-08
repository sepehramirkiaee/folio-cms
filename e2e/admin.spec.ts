import { expect, test } from "@playwright/test";

test.describe("admin", () => {
  test("a new published project appears on the public site", async ({ page }) => {
    await page.goto("/admin/projects/new");
    await page.getByRole("textbox", { name: "Title", exact: true }).fill("E2E Case Study");
    await page
      .getByRole("textbox", { name: "Summary", exact: true })
      .fill("Created by the end-to-end suite.");
    await page
      .getByRole("textbox", { name: "Case study", exact: true })
      .fill("First paragraph.\n\nSecond paragraph.");
    await page.getByRole("combobox", { name: "Status", exact: true }).click();
    await page.getByRole("option", { name: "Published" }).click();
    await page.getByRole("button", { name: "Skills", exact: true }).click();
    await page.getByRole("checkbox", { name: "Playwright" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/admin\/projects\/c/);

    await page.goto("/projects/e2e-case-study");
    await expect(page.getByRole("heading", { level: 1, name: "E2E Case Study" })).toBeVisible();
    await expect(page.getByText("Second paragraph.")).toBeVisible();
    await expect(page.getByText("Playwright", { exact: true })).toBeVisible();
  });

  test("projects reorder with the keyboard and the order persists", async ({ page }) => {
    await page.goto("/admin/projects");
    await page.getByRole("tab", { name: "Display order" }).click();
    const titles = page.locator("ol[aria-describedby='reorder-help'] li span.flex-1");
    await expect(titles.first()).toBeVisible();
    const [first, second] = await titles.allInnerTexts();

    const handle = page.getByRole("button", { name: `Reorder ${first}` });
    await handle.focus();
    // Each step waits for state a screen reader user also gets: the pressed
    // handle, then dnd-kit's live announcement of the new position.
    await page.keyboard.press("Space");
    await expect(handle).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByText(`${first} moved to position 2.`)).toBeAttached();
    await page.keyboard.press("Space");
    await expect(titles.nth(0)).toHaveText(second ?? "");
    await expect(titles.nth(1)).toHaveText(first ?? "");

    await page.reload();
    await page.getByRole("tab", { name: "Display order" }).click();
    await expect(titles.nth(0)).toHaveText(second ?? "");
  });

  test("opening a message marks it read and updates the unread count", async ({ page }) => {
    await page.goto("/admin/inbox");
    const nav = page.getByRole("navigation", { name: "Admin" });
    await expect(nav.getByText(/^\d+ unread$/)).toBeVisible();
    const before = Number(
      /\d+/.exec((await nav.getByText(/^\d+ unread$/).textContent()) ?? "")?.[0],
    );

    await page.getByRole("button", { name: /Frontend lead role/ }).click();
    await expect(page.getByRole("dialog")).toContainText("Hi Alex");
    await page.keyboard.press("Escape");

    await expect(nav.getByText(`${before - 1} unread`)).toBeVisible();
  });

  test("server validation errors are shown on the field", async ({ page }) => {
    await page.goto("/admin/skills");
    await page.getByRole("button", { name: "New skill" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Name" }).fill("TypeScript");
    await dialog.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option", { name: "Frontend" }).click();
    await dialog.getByRole("button", { name: "Add skill" }).click();
    await expect(dialog.getByText("A skill with this name already exists")).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: "Name" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
