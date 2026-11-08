import { connection } from "next/server";
import { getDb } from "@/lib/db";

/** Liveness and database check, used by the Docker healthcheck. */
export async function GET() {
  // Opt out of prerendering: this must run on every request.
  await connection();
  try {
    await getDb().$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
