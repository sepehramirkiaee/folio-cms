import { getDashboardStats } from "@/features/dashboard/server/stats";
import { withAdmin } from "@/lib/api/handler";

export const GET = withAdmin(async () => getDashboardStats());
