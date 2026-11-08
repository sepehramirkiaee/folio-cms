import NextAuth from "next-auth";
import { authConfig } from "@/features/auth/auth.config";

// First line of defense: redirects signed-out visitors away from /admin and
// returns 401 for /api/admin. Route handlers and the admin layout verify the
// session again, so a misconfigured matcher can never expose data.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
