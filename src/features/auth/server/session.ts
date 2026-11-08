import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** For server components and layouts. Redirects to the login page when signed out. */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}

/** For route handlers. Returns null when signed out so the caller can answer 401. */
export async function getAdminSession() {
  const session = await auth();
  return session?.user ? session : null;
}
