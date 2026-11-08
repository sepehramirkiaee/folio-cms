import { z } from "zod";

/**
 * Builds the query schema for a paginated admin list. Each feature passes the
 * columns it allows sorting by, so unknown sort fields are rejected instead of
 * reaching Prisma.
 */
export function listParamsSchema<const S extends readonly [string, ...string[]]>(
  sortFields: S,
  defaultSort: S[number],
  defaultDir: "asc" | "desc" = "asc",
) {
  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    q: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((v) => v || undefined),
    sort: z.enum(sortFields).default(defaultSort),
    dir: z.enum(["asc", "desc"]).default(defaultDir),
  });
}

export type BaseListParams = {
  page: number;
  pageSize: number;
  q?: string;
  sort: string;
  dir: "asc" | "desc";
};

/** Converts params to a query string, dropping empty values. */
export function toSearchParams(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export function paginate<T>(items: T[], total: number, page: number, pageSize: number) {
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}
