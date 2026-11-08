import { profileInputSchema } from "@/features/profile/schemas/profile";
import { getProfile, saveProfile } from "@/features/profile/server/profile";
import { parseBody, withAdmin } from "@/lib/api/handler";

export const GET = withAdmin(async () => getProfile());

export const PUT = withAdmin(async (req) => saveProfile(await parseBody(req, profileInputSchema)));
