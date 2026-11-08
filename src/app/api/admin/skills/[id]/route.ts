import { deleteSkill, getSkill, updateSkill } from "@/features/skills/server/skills";
import { skillInputSchema } from "@/features/skills/schemas/skill";
import { parseBody, withAdmin } from "@/lib/api/handler";

type Ctx = RouteContext<"/api/admin/skills/[id]">;

export const GET = withAdmin(async (_req, ctx: Ctx) => getSkill((await ctx.params).id));

export const PATCH = withAdmin(async (req, ctx: Ctx) =>
  updateSkill((await ctx.params).id, await parseBody(req, skillInputSchema)),
);

export const DELETE = withAdmin(async (_req, ctx: Ctx) => deleteSkill((await ctx.params).id));
