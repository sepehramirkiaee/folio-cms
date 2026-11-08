import { z } from "zod";
import { SkillCategory } from "@/generated/prisma/enums";
import { listParamsSchema } from "@/lib/api/list-params";

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATA: "Data",
  DEVOPS: "DevOps and testing",
  AI: "AI",
  DESIGN: "Design",
  OTHER: "Other",
};

export const skillCategories = Object.values(SkillCategory) as [SkillCategory, ...SkillCategory[]];

/** Create and update body. Shared by the form and the route handlers. */
export const skillInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a skill name").max(60, "Use at most 60 characters"),
  category: z.enum(skillCategories, { error: "Choose a category" }),
  featured: z.boolean(),
});

export type SkillInput = z.infer<typeof skillInputSchema>;

export const skillListParamsSchema = listParamsSchema(["name", "category", "usage"], "name").extend(
  {
    category: z.enum(skillCategories).optional().catch(undefined),
  },
);

export type SkillListParams = z.input<typeof skillListParamsSchema>;

/** A skill as the admin list and form see it. */
export type SkillRow = {
  id: string;
  name: string;
  slug: string;
  category: SkillCategory;
  featured: boolean;
  projectCount: number;
  experienceCount: number;
};

/** Minimal shape for pickers in other forms. */
export type SkillOption = { id: string; name: string; category: SkillCategory };
