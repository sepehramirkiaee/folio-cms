"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema } from "../schemas/login";

export type LoginResult = { error: string } | undefined;

export async function loginAction(input: unknown, callbackUrl?: string): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const redirectTo = safeAdminRedirect(callbackUrl);

  try {
    await signIn("credentials", { ...parsed.data, redirectTo });
  } catch (error) {
    // signIn throws a redirect on success, which must propagate.
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "That email and password do not match an admin account."
            : "Sign in failed. Please try again.",
      };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

/**
 * Auth.js passes callbackUrl as an absolute URL. Keep only the path, and only
 * when it points inside the admin, so the login page cannot be used as an
 * open redirect.
 */
function safeAdminRedirect(callbackUrl: string | undefined): string {
  if (!callbackUrl) return "/admin";
  try {
    const { pathname, search } = new URL(callbackUrl, "http://localhost");
    return /^\/admin(\/|$)/.test(pathname) && pathname !== "/admin/login"
      ? pathname + search
      : "/admin";
  } catch {
    return "/admin";
  }
}
