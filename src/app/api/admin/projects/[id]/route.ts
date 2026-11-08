import { projectInputSchema } from "@/features/projects/schemas/project";
import { deleteProject, getProject, updateProject } from "@/features/projects/server/projects";
import { parseBody, withAdmin } from "@/lib/api/handler";

type Ctx = RouteContext<"/api/admin/projects/[id]">;

export const GET = withAdmin(async (_req, ctx: Ctx) => getProject((await ctx.params).id));

export const PATCH = withAdmin(async (req, ctx: Ctx) =>
  updateProject((await ctx.params).id, await parseBody(req, projectInputSchema)),
);

export const DELETE = withAdmin(async (_req, ctx: Ctx) => deleteProject((await ctx.params).id));
