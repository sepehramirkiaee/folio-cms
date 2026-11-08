import { describe, expect, it } from "vitest";
import { profileInputSchema } from "./profile";

const valid = {
  fullName: "Alex Rivera",
  headline: "Senior frontend engineer",
  bio: "Fifteen years of web platforms.",
  location: null,
  email: null,
  githubUrl: null,
  linkedinUrl: null,
  avatarUrl: null,
};

describe("profileInputSchema", () => {
  it("accepts a profile with only the required fields", () => {
    expect(profileInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a malformed email and non-http links", () => {
    const result = profileInputSchema.safeParse({
      ...valid,
      email: "not-an-email",
      githubUrl: "ftp://example.com",
    });
    expect(result.error?.issues.map((i) => i.message)).toEqual([
      "Enter a valid email address",
      "Enter a full URL starting with https://",
    ]);
  });
});
