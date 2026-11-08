/**
 * Fixed-window rate limiter kept in memory. Good enough for a single server
 * process (one container), which is how folio-cms is deployed. A multi-instance
 * deployment would move this to Redis or the database.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    /** Returns true if the request is allowed and counts it. */
    take(key: string, now = Date.now()): boolean {
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        if (hits.size > 10_000) {
          // Drop expired entries so the map cannot grow without bound.
          for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        }
        return true;
      }
      if (entry.count >= limit) return false;
      entry.count += 1;
      return true;
    },
  };
}

/** Best-effort client IP behind a reverse proxy. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
