import { describe, expect, it } from "vitest";
import { skillInputSchema, skillListParamsSchema } from "./skill";

describe("skillInputSchema", () => {
  it("trims names and accepts valid input", () => {
    expect(
      skillInputSchema.parse({ name: "  React  ", category: "FRONTEND", featured: true }),
    ).toEqual({ name: "React", category: "FRONTEND", featured: true });
  });

  it("explains each invalid field", () => {
    const result = skillInputSchema.safeParse({ name: " ", category: "NOPE", featured: true });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain("Enter a skill name");
    expect(messages).toContain("Choose a category");
  });
});

describe("skillListParamsSchema", () => {
  it("applies defaults and coerces numbers from the query string", () => {
    expect(skillListParamsSchema.parse({ page: "2" })).toMatchObject({
      page: 2,
      pageSize: 10,
      sort: "name",
      dir: "asc",
    });
  });

  it("rejects sort fields that are not whitelisted", () => {
    expect(skillListParamsSchema.safeParse({ sort: "passwordHash" }).success).toBe(false);
  });

  it("ignores an unknown category filter instead of failing", () => {
    expect(skillListParamsSchema.parse({ category: "nope" }).category).toBeUndefined();
  });
});
