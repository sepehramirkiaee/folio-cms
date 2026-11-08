import { experienceInputSchema } from "@/features/experience/schemas/experience";
import {
  deleteExperience,
  getExperience,
  updateExperience,
} from "@/features/experience/server/experience";
import { parseBody, withAdmin } from "@/lib/api/handler";

type Ctx = RouteContext<"/api/admin/experience/[id]">;

export const GET = withAdmin(async (_req, ctx: Ctx) => getExperience((await ctx.params).id));

export const PATCH = withAdmin(async (req, ctx: Ctx) =>
  updateExperience((await ctx.params).id, await parseBody(req, experienceInputSchema)),
);

export const DELETE = withAdmin(async (_req, ctx: Ctx) => deleteExperience((await ctx.params).id));
