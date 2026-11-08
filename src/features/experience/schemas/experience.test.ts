import { describe, expect, it } from "vitest";
import { experienceInputSchema } from "./experience";

const valid = {
  company: "Northwind",
  role: "Senior Frontend Engineer",
  location: null,
  companyUrl: null,
  startDate: "2023-03",
  endDate: null,
  summary: "Frontend lead.",
  highlights: ["Rebuilt checkout"],
  skillIds: [],
};

const issues = (input: unknown) =>
  experienceInputSchema
    .safeParse(input)
    .error?.issues.map((i) => `${i.path.join(".")}: ${i.message}`);

describe("experienceInputSchema", () => {
  it("accepts a current role without an end month", () => {
    expect(experienceInputSchema.parse(valid).endDate).toBeNull();
  });

  it("only accepts real months", () => {
    expect(issues({ ...valid, startDate: "2023-13" })).toEqual(["startDate: Enter a start month"]);
  });

  it("rejects an end month before the start month", () => {
    expect(issues({ ...valid, endDate: "2022-12" })).toEqual([
      "endDate: The end month must be after the start month",
    ]);
    expect(experienceInputSchema.safeParse({ ...valid, endDate: "2023-03" }).success).toBe(true);
  });

  it("points empty highlights at their position", () => {
    expect(issues({ ...valid, highlights: ["ok", "  "] })).toEqual([
      "highlights.1: Write the highlight or remove it",
    ]);
  });
});
