import { z } from "zod";
import { ProjectStatus } from "@/generated/prisma/enums";
import { listParamsSchema } from "@/lib/api/list-params";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
};
export const projectStatuses = Object.values(ProjectStatus) as [ProjectStatus, ...ProjectStatus[]];

const optionalUrl = z
  .string()
  .trim()
  .max(500, "Use at most 500 characters")
  .pipe(z.url({ protocol: /^https?$/, error: "Enter a full URL starting with https://" }))
  .nullable();

const currentYear = new Date().getFullYear();

/**
 * Create and update body, shared by the project form and the route handlers.
 * Optional fields are null when empty, the form converts "" to null on input.
 */
export const projectInputSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(120, "Use at most 120 characters"),
  slug: z
    .string()
    .trim()
    .max(80, "Use at most 80 characters")
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, "Use lowercase letters, numbers and single dashes"),
  summary: z
    .string()
    .trim()
    .min(1, "Write a one or two sentence summary")
    .max(280, "Keep the summary under 280 characters"),
  body: z.string().trim().max(20_000, "Use at most 20,000 characters"),
  coverImageUrl: optionalUrl,
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  year: z
    .number({ error: "Enter a year" })
    .int("Enter a whole year")
    .min(1990, "Enter a year after 1990")
    .max(currentYear + 1, `Enter a year up to ${currentYear + 1}`)
    .nullable(),
  status: z.enum(projectStatuses),
  featured: z.boolean(),
  skillIds: z.array(z.string().min(1)).max(30, "Pick at most 30 skills"),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const projectListParamsSchema = listParamsSchema(
  ["order", "title", "year", "status", "updatedAt"],
  "order",
).extend({
  status: z.enum(projectStatuses).optional().catch(undefined),
});
export type ProjectListParams = z.input<typeof projectListParamsSchema>;

export const projectOrderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
});
export type ProjectOrderInput = z.infer<typeof projectOrderSchema>;

/** A project as the admin list shows it. */
export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  featured: boolean;
  year: number | null;
  sortOrder: number;
  skillCount: number;
  updatedAt: string;
};

/** A project as the edit form needs it. */
export type ProjectDetail = Omit<ProjectRow, "skillCount"> &
  Omit<ProjectInput, "slug"> & {
    slug: string;
  };

/** Minimal shape for the reorder list. */
export type ProjectOrderItem = Pick<
  ProjectRow,
  "id" | "title" | "status" | "featured" | "sortOrder"
>;
