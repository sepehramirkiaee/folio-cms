import { expect, test } from "@playwright/test";

test.describe("admin access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("signed-out visitors are sent to the login page and back after sign in", async ({
    page,
  }) => {
    await page.goto("/admin/inbox");
    await expect(page).toHaveURL(/\/admin\/login\?callbackUrl=/);

    await page.getByLabel("Email").fill("demo@folio-cms.dev");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(
      page.getByText("That email and password do not match an admin account."),
    ).toBeVisible();

    await page.getByLabel("Password").fill("demo-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/admin/inbox");
    await expect(page.getByRole("heading", { name: "Inbox" })).toBeVisible();
  });

  test("the admin API rejects requests without a session", async ({ request }) => {
    for (const [method, path] of [
      ["GET", "/api/admin/projects"],
      ["PUT", "/api/admin/projects/order"],
      ["DELETE", "/api/admin/skills/anything"],
      ["GET", "/api/admin/stats"],
    ] as const) {
      const res = await request.fetch(path, { method, data: {} });
      expect(res.status(), `${method} ${path}`).toBe(401);
    }
  });
});

test("signing out ends the session", async ({ browser }) => {
  // A fresh sign-in, so signing out does not invalidate the shared session file.
  const page = await browser.newPage({ storageState: { cookies: [], origins: [] } });
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("demo@folio-cms.dev");
  await page.getByLabel("Password").fill("demo-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.close();
});
