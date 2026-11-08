import { z } from "zod";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "./admin-defaults.ts";

/**
 * Server environment, validated once on first access.
 *
 * Validation is lazy on purpose: `next build` runs without a database or
 * secrets (the Docker image is built before any env exists), so nothing here
 * may run at import time.
 */
const booleanString = z
  .enum(["true", "false", "1", "0", ""])
  .optional()
  .transform((v) => v === "true" || v === "1");

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: "DATABASE_URL must be a postgres URL",
  }),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_URL: z.url().optional(),
  DEMO_MODE: booleanString,
  ADMIN_EMAIL: z.email().default(DEFAULT_ADMIN_EMAIL),
  ADMIN_PASSWORD: z.string().min(8).default(DEFAULT_ADMIN_PASSWORD),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function env(): ServerEnv {
  if (cached) return cached;
  // Treat empty strings as unset, so `ADMIN_EMAIL=` in compose falls back to the default.
  const raw = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ""));
  const parsed = serverEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Safe to call from anywhere, including client-reachable server components. */
export function isDemoMode(): boolean {
  const v = process.env.DEMO_MODE;
  return v === "true" || v === "1";
}
