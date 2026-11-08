import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/errors";
import { paginate } from "@/lib/api/list-params";
import { getDb } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { SkillInput, SkillOption, SkillRow } from "../schemas/skill";
import type { skillListParamsSchema } from "../schemas/skill";
import type { z } from "zod";

const select = {
  id: true,
  name: true,
  slug: true,
  category: true,
  featured: true,
  _count: { select: { projects: true, experiences: true } },
} satisfies Prisma.SkillSelect;

type Selected = Prisma.SkillGetPayload<{ select: typeof select }>;

function toRow({ _count, ...skill }: Selected): SkillRow {
  return { ...skill, projectCount: _count.projects, experienceCount: _count.experiences };
}

export async function listSkills(params: z.output<typeof skillListParamsSchema>) {
  const where: Prisma.SkillWhereInput = {
    ...(params.q && { name: { contains: params.q, mode: "insensitive" } }),
    ...(params.category && { category: params.category }),
  };
  const orderBy: Prisma.SkillOrderByWithRelationInput[] =
    params.sort === "usage"
      ? [{ projects: { _count: params.dir } }, { name: "asc" }]
      : params.sort === "category"
        ? [{ category: params.dir }, { name: "asc" }]
        : [{ name: params.dir }];

  const db = getDb();
  const [items, total] = await db.$transaction([
    db.skill.findMany({
      where,
      orderBy,
      select,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    db.skill.count({ where }),
  ]);
  return paginate(items.map(toRow), total, params.page, params.pageSize);
}

/** All skills, for the multi-select pickers in the project and experience forms. */
export async function listSkillOptions(): Promise<SkillOption[]> {
  return getDb().skill.findMany({
    select: { id: true, name: true, category: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function getSkill(id: string): Promise<SkillRow> {
  const skill = await getDb().skill.findUnique({ where: { id }, select });
  if (!skill) throw ApiError.notFound("Skill");
  return toRow(skill);
}

export async function createSkill(input: SkillInput): Promise<SkillRow> {
  return withNameConflict(async () =>
    toRow(await getDb().skill.create({ data: { ...input, slug: slugify(input.name) }, select })),
  );
}

export async function updateSkill(id: string, input: SkillInput): Promise<SkillRow> {
  return withNameConflict(async () =>
    toRow(
      await getDb().skill.update({
        where: { id },
        data: { ...input, slug: slugify(input.name) },
        select,
      }),
    ),
  );
}

export async function deleteSkill(id: string): Promise<void> {
  await getDb().skill.delete({ where: { id } });
}

/** Rejects skill ids that do not exist, as a field error on the skill picker. */
export async function assertSkillsExist(skillIds: string[]): Promise<void> {
  if (skillIds.length === 0) return;
  const count = await getDb().skill.count({ where: { id: { in: skillIds } } });
  if (count !== new Set(skillIds).size) {
    throw new ApiError("VALIDATION_ERROR", "Some skills no longer exist", {
      skillIds: ["Some selected skills no longer exist. Refresh and pick again."],
    });
  }
}

/**
 * The slug is derived from the name, so a slug clash ("Next.js" and "NextJS")
 * is reported on the name field, where the user can fix it.
 */
async function withNameConflict<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw new ApiError("CONFLICT", "A skill with this name already exists", {
        name: ["A skill with this name already exists"],
      });
    }
    throw error;
  }
}
