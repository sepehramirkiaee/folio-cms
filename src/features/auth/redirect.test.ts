import { describe, expect, it } from "vitest";
import { safeAdminRedirect } from "./redirect";

describe("safeAdminRedirect", () => {
  it("keeps admin paths and their query string", () => {
    expect(safeAdminRedirect("http://localhost:3000/admin/projects?page=2")).toBe(
      "/admin/projects?page=2",
    );
    expect(safeAdminRedirect("/admin/skills")).toBe("/admin/skills");
  });

  it("drops the origin of absolute URLs", () => {
    expect(safeAdminRedirect("https://evil.example/admin")).toBe("/admin");
  });

  it.each([
    ["missing", undefined],
    ["public page", "/projects/foo"],
    ["look-alike path", "/administrator"],
    ["protocol-relative URL", "//evil.example/admin"],
    ["the login page itself", "/admin/login"],
  ])("falls back to /admin for a %s", (_, input) => {
    expect(safeAdminRedirect(input)).toBe("/admin");
  });
});
