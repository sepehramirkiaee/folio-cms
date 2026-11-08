import { listSkillOptions } from "@/features/skills/server/skills";
import { withAdmin } from "@/lib/api/handler";

export const GET = withAdmin(async () => listSkillOptions());
