// Runs once when the server starts. Fails fast on bad configuration instead
// of erroring on the first request.

const LOCAL_SECRET = "local-dev-secret-change-me-in-production-0123456789";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { env } = await import("./lib/env");
  const config = env();

  const url = config.AUTH_URL ?? "";
  const isLocal = !url || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url);
  if (config.AUTH_SECRET === LOCAL_SECRET && !isLocal) {
    console.warn(
      "\n  WARNING: AUTH_SECRET is the public local default but AUTH_URL is not localhost.\n" +
        "  Generate your own secret with: openssl rand -base64 32\n",
    );
  }
}
