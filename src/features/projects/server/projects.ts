import "server-only";
import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/errors";
import { paginate } from "@/lib/api/list-params";
import { assertSkillsExist } from "@/features/skills/server/skills";
import { getDb } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type {
  ProjectDetail,
  ProjectInput,
  ProjectOrderItem,
  ProjectRow,
  projectListParamsSchema,
} from "../schemas/project";

const rowSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  featured: true,
  year: true,
  sortOrder: true,
  updatedAt: true,
  _count: { select: { skills: true } },
} satisfies Prisma.ProjectSelect;

const detailSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  body: true,
  coverImageUrl: true,
  liveUrl: true,
  repoUrl: true,
  year: true,
  status: true,
  featured: true,
  sortOrder: true,
  updatedAt: true,
  skills: { select: { id: true } },
} satisfies Prisma.ProjectSelect;

function toRow({
  _count,
  updatedAt,
  ...p
}: Prisma.ProjectGetPayload<{ select: typeof rowSelect }>): ProjectRow {
  return { ...p, skillCount: _count.skills, updatedAt: updatedAt.toISOString() };
}

function toDetail({
  skills,
  updatedAt,
  ...p
}: Prisma.ProjectGetPayload<{ select: typeof detailSelect }>): ProjectDetail {
  return { ...p, skillIds: skills.map((s) => s.id), updatedAt: updatedAt.toISOString() };
}

const orderByField = {
  order: "sortOrder",
  title: "title",
  year: "year",
  status: "status",
  updatedAt: "updatedAt",
} as const;

export async function listProjects(params: z.output<typeof projectListParamsSchema>) {
  const where: Prisma.ProjectWhereInput = {
    ...(params.q && {
      OR: [
        { title: { contains: params.q, mode: "insensitive" } },
        { summary: { contains: params.q, mode: "insensitive" } },
      ],
    }),
    ...(params.status && { status: params.status }),
  };
  const field = orderByField[params.sort];
  const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [
    field === "year" ? { year: { sort: params.dir, nulls: "last" } } : { [field]: params.dir },
    { sortOrder: "asc" },
  ];

  const db = getDb();
  const [items, total] = await db.$transaction([
    db.project.findMany({
      where,
      orderBy,
      select: rowSelect,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    db.project.count({ where }),
  ]);
  return paginate(items.map(toRow), total, params.page, params.pageSize);
}

/** Every project in display order, for the drag-to-reorder view. */
export async function listProjectOrder(): Promise<ProjectOrderItem[]> {
  return getDb().project.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, status: true, featured: true, sortOrder: true },
  });
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const project = await getDb().project.findUnique({ where: { id }, select: detailSelect });
  if (!project) throw ApiError.notFound("Project");
  return toDetail(project);
}

export async function createProject(input: ProjectInput): Promise<ProjectDetail> {
  const { skillIds, ...fields } = input;
  await assertSkillsExist(skillIds);
  const db = getDb();
  const last = await db.project.aggregate({ _max: { sortOrder: true } });
  return withSlugConflict(async () =>
    toDetail(
      await db.project.create({
        data: {
          ...fields,
          slug: fields.slug || slugify(fields.title),
          // New projects go to the end of the manual order.
          sortOrder: (last._max.sortOrder ?? -1) + 1,
          skills: { connect: skillIds.map((id) => ({ id })) },
        },
        select: detailSelect,
      }),
    ),
  );
}

export async function updateProject(id: string, input: ProjectInput): Promise<ProjectDetail> {
  const { skillIds, ...fields } = input;
  await assertSkillsExist(skillIds);
  return withSlugConflict(async () =>
    toDetail(
      await getDb().project.update({
        where: { id },
        data: {
          ...fields,
          slug: fields.slug || slugify(fields.title),
          skills: { set: skillIds.map((skillId) => ({ id: skillId })) },
        },
        select: detailSelect,
      }),
    ),
  );
}

export async function deleteProject(id: string): Promise<void> {
  await getDb().project.delete({ where: { id } });
}

/**
 * Saves a new manual order. The client must send every project id, so a
 * stale list (someone added or removed a project meanwhile) is rejected
 * instead of silently leaving gaps or duplicates.
 */
export async function reorderProjects(ids: string[]): Promise<ProjectOrderItem[]> {
  const db = getDb();
  const existing = await db.project.findMany({ select: { id: true } });
  const known = new Set(existing.map((p) => p.id));
  const unique = new Set(ids);
  if (unique.size !== ids.length || ids.length !== known.size || ids.some((id) => !known.has(id))) {
    throw new ApiError("CONFLICT", "The project list changed. Refresh and try again.");
  }
  await db.$transaction(
    ids.map((id, index) => db.project.update({ where: { id }, data: { sortOrder: index } })),
  );
  return listProjectOrder();
}

async function withSlugConflict<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw new ApiError("CONFLICT", "Another project already uses this URL slug", {
        slug: ["Another project already uses this URL slug"],
      });
    }
    throw error;
  }
}
