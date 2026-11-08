import { expect, test as setup } from "@playwright/test";

// Signs in once and saves the session for the admin specs.
setup("sign in as the demo admin", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("demo@folio-cms.dev");
  await page.getByLabel("Password").fill("demo-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.context().storageState({ path: "e2e/.auth/admin.json" });
});
