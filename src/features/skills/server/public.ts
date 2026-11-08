import "server-only";
import type { SkillCategory } from "@/generated/prisma/enums";
import { getDb } from "@/lib/db";
import { skillCategories } from "../schemas/skill";

/** Featured skills grouped by category, in the category order of the enum. */
export async function listSkillGroups(): Promise<{ category: SkillCategory; names: string[] }[]> {
  const skills = await getDb().skill.findMany({
    where: { featured: true },
    select: { name: true, category: true },
    orderBy: { name: "asc" },
  });
  return skillCategories
    .map((category) => ({
      category,
      names: skills.filter((s) => s.category === category).map((s) => s.name),
    }))
    .filter((g) => g.names.length > 0);
}
