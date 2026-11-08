import { z } from "zod";
import { listParamsSchema } from "@/lib/api/list-params";

const month = /^\d{4}-(0[1-9]|1[0-2])$/;

const optionalUrl = z
  .string()
  .trim()
  .max(500, "Use at most 500 characters")
  .pipe(z.url({ protocol: /^https?$/, error: "Enter a full URL starting with https://" }))
  .nullable();

/**
 * Create and update body. Dates are months ("2024-03"), because a CV never
 * needs the day. The server stores the first day of the month.
 */
export const experienceInputSchema = z
  .object({
    company: z.string().trim().min(1, "Enter the company").max(120, "Use at most 120 characters"),
    role: z.string().trim().min(1, "Enter your role").max(120, "Use at most 120 characters"),
    location: z.string().trim().max(120, "Use at most 120 characters").nullable(),
    companyUrl: optionalUrl,
    startDate: z.string().regex(month, "Enter a start month"),
    endDate: z.string().regex(month, "Enter an end month").nullable(),
    summary: z
      .string()
      .trim()
      .min(1, "Write a short summary")
      .max(1000, "Use at most 1,000 characters"),
    highlights: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Write the highlight or remove it")
          .max(200, "Use at most 200 characters"),
      )
      .max(10, "Add at most 10 highlights"),
    skillIds: z.array(z.string().min(1)).max(30, "Pick at most 30 skills"),
  })
  // "YYYY-MM" strings sort chronologically, so a string compare is enough.
  .refine((v) => v.endDate === null || v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "The end month must be after the start month",
  });

export type ExperienceInput = z.infer<typeof experienceInputSchema>;

export const experienceListParamsSchema = listParamsSchema(
  ["startDate", "company", "role"],
  "startDate",
  "desc",
);
export type ExperienceListParams = z.input<typeof experienceListParamsSchema>;

export type ExperienceRow = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  skillCount: number;
};

export type ExperienceDetail = ExperienceInput & { id: string; updatedAt: string };
