import type { NextAuthConfig } from "next-auth";

// Edge-safe part of the Auth.js config: no database access, no Node APIs.
// Used on its own by proxy.ts, and extended with the Credentials provider in
// src/lib/auth.ts.

const ADMIN_PAGES = /^\/admin(\/|$)/;
const ADMIN_API = /^\/api\/admin(\/|$)/;
const LOGIN_PAGE = "/admin/login";

export const authConfig = {
  pages: { signIn: LOGIN_PAGE },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  trustHost: true,
  providers: [],
  callbacks: {
    /** Optimistic check in proxy.ts. Every handler and layout checks again on the server. */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const signedIn = Boolean(auth?.user);

      if (pathname === LOGIN_PAGE) {
        return signedIn ? Response.redirect(new URL("/admin", request.nextUrl)) : true;
      }
      if (ADMIN_API.test(pathname) && !signedIn) {
        return Response.json(
          { error: { code: "UNAUTHORIZED", message: "Sign in to continue" } },
          { status: 401 },
        );
      }
      if (ADMIN_PAGES.test(pathname)) return signedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.isDemo = user.isDemo;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.isDemo = Boolean(token.isDemo);
      return session;
    },
  },
} satisfies NextAuthConfig;
