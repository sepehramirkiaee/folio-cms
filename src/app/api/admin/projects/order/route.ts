import { projectOrderSchema } from "@/features/projects/schemas/project";
import { listProjectOrder, reorderProjects } from "@/features/projects/server/projects";
import { parseBody, withAdmin } from "@/lib/api/handler";

export const GET = withAdmin(async () => listProjectOrder());

export const PUT = withAdmin(async (req) => {
  const { ids } = await parseBody(req, projectOrderSchema);
  return reorderProjects(ids);
});
