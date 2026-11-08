import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it.each([
    ["Next.js", "next-js"],
    ["Tailwind CSS", "tailwind-css"],
    ["  Café & Crème  ", "cafe-creme"],
    ["C++ / C#", "c-c"],
  ])("%s -> %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});
