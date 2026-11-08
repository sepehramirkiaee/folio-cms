import type { PrismaConfig } from "prisma/config";

// The Prisma CLI does not read .env files on its own. Node's built-in loader
// covers local development without adding a dotenv dependency. In Docker and
// CI the variables come from the environment, so a missing file is fine.
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

// A type-only import keeps this file free of runtime dependencies, so the
// production image can run migrations with a standalone Prisma CLI.
export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig;
