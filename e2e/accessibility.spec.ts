import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./fixtures";

const publicPages = ["/", "/projects/checkout-platform-rebuild", "/projects/does-not-exist"];
const adminPages = [
  "/admin",
  "/admin/projects",
  "/admin/projects/new",
  "/admin/experience",
  "/admin/experience/new",
  "/admin/skills",
  "/admin/inbox",
  "/admin/profile",
];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`accessibility in ${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test.describe("public", () => {
      test.use({ storageState: { cookies: [], origins: [] } });
      for (const path of [...publicPages, "/admin/login"]) {
        test(path, async ({ page }) => {
          await page.goto(path);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          await expectNoA11yViolations(page);
        });
      }
    });

    test.describe("admin", () => {
      for (const path of adminPages) {
        test(path, async ({ page }) => {
          await page.goto(path);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          // Wait for client data so axe sees the real content, not skeletons.
          await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
          await expectNoA11yViolations(page);
        });
      }

      test("dialogs: skill form and delete confirmation", async ({ page }) => {
        await page.goto("/admin/skills");
        await page.getByRole("button", { name: "New skill" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expectNoA11yViolations(page);
      });
    });
  });
}
