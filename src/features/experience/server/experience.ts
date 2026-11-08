import "server-only";
import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/errors";
import { paginate } from "@/lib/api/list-params";
import { assertSkillsExist } from "@/features/skills/server/skills";
import { getDb } from "@/lib/db";
import { assertDemoCapacity } from "@/lib/demo";
import type {
  ExperienceDetail,
  ExperienceInput,
  ExperienceRow,
  experienceListParamsSchema,
} from "../schemas/experience";

/** "2024-03" to a UTC date on the first of the month, and back. */
const toDate = (month: string) => new Date(`${month}-01T00:00:00.000Z`);
const toMonth = (date: Date) => date.toISOString().slice(0, 7);

const rowSelect = {
  id: true,
  company: true,
  role: true,
  location: true,
  startDate: true,
  endDate: true,
  _count: { select: { skills: true } },
} satisfies Prisma.ExperienceSelect;

const detailSelect = {
  id: true,
  company: true,
  role: true,
  location: true,
  companyUrl: true,
  startDate: true,
  endDate: true,
  summary: true,
  highlights: true,
  updatedAt: true,
  skills: { select: { id: true } },
} satisfies Prisma.ExperienceSelect;

function toRow({
  _count,
  startDate,
  endDate,
  ...e
}: Prisma.ExperienceGetPayload<{ select: typeof rowSelect }>): ExperienceRow {
  return {
    ...e,
    startDate: toMonth(startDate),
    endDate: endDate ? toMonth(endDate) : null,
    skillCount: _count.skills,
  };
}

function toDetail({
  skills,
  startDate,
  endDate,
  updatedAt,
  ...e
}: Prisma.ExperienceGetPayload<{ select: typeof detailSelect }>): ExperienceDetail {
  return {
    ...e,
    startDate: toMonth(startDate),
    endDate: endDate ? toMonth(endDate) : null,
    skillIds: skills.map((s) => s.id),
    updatedAt: updatedAt.toISOString(),
  };
}

function toData({ skillIds: _skillIds, startDate, endDate, ...fields }: ExperienceInput) {
  return { ...fields, startDate: toDate(startDate), endDate: endDate ? toDate(endDate) : null };
}

export async function listExperience(params: z.output<typeof experienceListParamsSchema>) {
  const where: Prisma.ExperienceWhereInput = params.q
    ? {
        OR: [
          { company: { contains: params.q, mode: "insensitive" } },
          { role: { contains: params.q, mode: "insensitive" } },
        ],
      }
    : {};
  const db = getDb();
  const [items, total] = await db.$transaction([
    db.experience.findMany({
      where,
      orderBy: [{ [params.sort]: params.dir }, { startDate: "desc" }],
      select: rowSelect,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    db.experience.count({ where }),
  ]);
  return paginate(items.map(toRow), total, params.page, params.pageSize);
}

export async function getExperience(id: string): Promise<ExperienceDetail> {
  const entry = await getDb().experience.findUnique({ where: { id }, select: detailSelect });
  if (!entry) throw ApiError.notFound("Experience entry");
  return toDetail(entry);
}

export async function createExperience(input: ExperienceInput): Promise<ExperienceDetail> {
  await assertDemoCapacity("experience");
  await assertSkillsExist(input.skillIds);
  const entry = await getDb().experience.create({
    data: { ...toData(input), skills: { connect: input.skillIds.map((id) => ({ id })) } },
    select: detailSelect,
  });
  return toDetail(entry);
}

export async function updateExperience(
  id: string,
  input: ExperienceInput,
): Promise<ExperienceDetail> {
  await assertSkillsExist(input.skillIds);
  const entry = await getDb().experience.update({
    where: { id },
    data: { ...toData(input), skills: { set: input.skillIds.map((skillId) => ({ id: skillId })) } },
    select: detailSelect,
  });
  return toDetail(entry);
}

export async function deleteExperience(id: string): Promise<void> {
  await getDb().experience.delete({ where: { id } });
}
