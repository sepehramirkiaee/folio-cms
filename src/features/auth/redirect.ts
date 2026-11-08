/**
 * Auth.js passes callbackUrl as an absolute URL. Keep only the path, and only
 * when it points inside the admin, so the login page cannot be used as an
 * open redirect.
 */
export function safeAdminRedirect(callbackUrl: string | null | undefined): string {
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
