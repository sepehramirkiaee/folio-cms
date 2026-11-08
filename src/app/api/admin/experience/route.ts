import {
  experienceInputSchema,
  experienceListParamsSchema,
} from "@/features/experience/schemas/experience";
import { createExperience, listExperience } from "@/features/experience/server/experience";
import { parseBody, parseQuery, withAdmin } from "@/lib/api/handler";

export const GET = withAdmin(async (req) =>
  listExperience(parseQuery(req, experienceListParamsSchema)),
);

export const POST = withAdmin(async (req) =>
  createExperience(await parseBody(req, experienceInputSchema)),
);
