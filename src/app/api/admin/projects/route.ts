import { projectInputSchema, projectListParamsSchema } from "@/features/projects/schemas/project";
import { createProject, listProjects } from "@/features/projects/server/projects";
import { parseBody, parseQuery, withAdmin } from "@/lib/api/handler";

export const GET = withAdmin(async (req) => listProjects(parseQuery(req, projectListParamsSchema)));

export const POST = withAdmin(async (req) =>
  createProject(await parseBody(req, projectInputSchema)),
);
