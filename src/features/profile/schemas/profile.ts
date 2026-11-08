import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(500, "Use at most 500 characters")
  .pipe(z.url({ protocol: /^https?$/, error: "Enter a full URL starting with https://" }))
  .nullable();

/** The intro on the home page. One row, always id 1. */
export const profileInputSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name").max(100, "Use at most 100 characters"),
  headline: z
    .string()
    .trim()
    .min(1, "Write a one-line headline")
    .max(160, "Keep the headline under 160 characters"),
  bio: z.string().trim().min(1, "Write a short bio").max(2000, "Use at most 2,000 characters"),
  location: z.string().trim().max(100, "Use at most 100 characters").nullable(),
  email: z.email("Enter a valid email address").nullable(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  avatarUrl: optionalUrl,
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type Profile = ProfileInput & { updatedAt: string };
