import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    isDemo?: boolean;
  }
  interface Session {
    user: { id: string; isDemo: boolean } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    isDemo?: boolean;
  }
}
