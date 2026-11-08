import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/features/auth/auth.config";
import { loginSchema } from "@/features/auth/schemas/login";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await getDb().user.findUnique({ where: { email: parsed.data.email } });
        // Always run a hash comparison so response time does not reveal
        // whether the email exists.
        const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !ok) return null;

        return { id: user.id, email: user.email, name: user.name, isDemo: user.isDemo };
      },
    }),
  ],
});

/** Hash of a random string, compared against when the email is unknown. */
const DUMMY_HASH =
  "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + Buffer.alloc(64).toString("base64");
