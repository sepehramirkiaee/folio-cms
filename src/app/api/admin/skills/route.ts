import { createSkill, listSkills } from "@/features/skills/server/skills";
import { skillInputSchema, skillListParamsSchema } from "@/features/skills/schemas/skill";
import { parseBody, parseQuery, withAdmin } from "@/lib/api/handler";

export const GET = withAdmin(async (req) => listSkills(parseQuery(req, skillListParamsSchema)));

export const POST = withAdmin(async (req) => createSkill(await parseBody(req, skillInputSchema)));
