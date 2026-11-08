/** Public base URL, from AUTH_URL (the one URL setting the app already has). */
export function siteUrl(): string {
  return (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}
