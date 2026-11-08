import { expect, test } from "@playwright/test";

// Visitors are signed out.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("public site", () => {
  test("home shows the intro and every section from the database", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(
      "Alex Rivera, Senior frontend engineer building fast, accessible web platforms",
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Senior frontend engineer building fast, accessible web platforms",
    );
    for (const name of ["Selected work", "Experience", "Skills", "Contact"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    // Drafts never appear on the public site.
    await expect(page.getByText("Offline field inspection app")).toHaveCount(0);
  });

  test("the skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("a project opens on its own page and links back", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Atlas design system/ }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Atlas design system" }),
    ).toBeVisible();
    await expect(page).toHaveTitle("Atlas design system | Alex Rivera");
    await page.getByRole("link", { name: "All work" }).click();
    await expect(page).toHaveURL(/#work$/);
  });

  test("unpublished and unknown projects show the not found page", async ({ page }) => {
    for (const slug of ["offline-field-app", "does-not-exist"]) {
      await page.goto(`/projects/${slug}`);
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
        "content",
        /noindex/,
      );
    }
  });

  test("the contact form validates and sends a message", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Enter your name")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeFocused();

    await page.getByLabel("Name").fill("E2E Visitor");
    await page.getByLabel("Email").fill("visitor@example.com");
    await page.getByLabel("Message").fill("Hello from the end-to-end test suite.");
    await page.getByRole("button", { name: "Send message" }).click();

    const status = page.getByRole("status").filter({ hasText: "Message sent" });
    await expect(status).toBeVisible();
    await expect(status).toBeFocused();
  });

  test("sitemap lists published projects only", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/projects/atlas-design-system");
    expect(xml).not.toContain("offline-field-app");
  });
});
