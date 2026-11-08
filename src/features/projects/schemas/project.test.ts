import { describe, expect, it } from "vitest";
import { projectInputSchema } from "./project";

const valid = {
  title: "Checkout rebuild",
  slug: "",
  summary: "Rebuilt the checkout.",
  body: "",
  coverImageUrl: null,
  liveUrl: "https://example.com",
  repoUrl: null,
  year: 2025,
  status: "PUBLISHED",
  featured: true,
  skillIds: ["s1"],
};

const messages = (input: unknown) =>
  projectInputSchema.safeParse(input).error?.issues.map((i) => `${i.path.join(".")}: ${i.message}`);

describe("projectInputSchema", () => {
  it("accepts a complete project and an empty slug", () => {
    expect(projectInputSchema.parse(valid)).toMatchObject({ slug: "", year: 2025 });
  });

  it("requires a title and a short summary", () => {
    expect(messages({ ...valid, title: "  ", summary: "x".repeat(281) })).toEqual([
      "title: Enter a title",
      "summary: Keep the summary under 280 characters",
    ]);
  });

  it("only accepts lowercase dashed slugs", () => {
    expect(messages({ ...valid, slug: "Not A Slug" })).toEqual([
      "slug: Use lowercase letters, numbers and single dashes",
    ]);
    expect(projectInputSchema.parse({ ...valid, slug: "case-study-2" }).slug).toBe("case-study-2");
  });

  it("only accepts http and https links", () => {
    expect(messages({ ...valid, liveUrl: "javascript:alert(1)" })).toEqual([
      "liveUrl: Enter a full URL starting with https://",
    ]);
  });

  it("validates the year range and allows no year", () => {
    expect(messages({ ...valid, year: 1980 })).toEqual(["year: Enter a year after 1990"]);
    expect(projectInputSchema.parse({ ...valid, year: null }).year).toBeNull();
  });
});
