// Run by the Docker entrypoint on every start, after migrations.
// Seeds only a fresh database, so restarts never touch existing content.
import { getDb } from "../src/lib/db.ts";
import { isDatabaseEmpty, printLogin, seedDatabase } from "../prisma/seed-lib.ts";

const db = getDb();
try {
  if (await isDatabaseEmpty(db)) {
    console.log("Empty database detected, seeding demo content...");
    printLogin(await seedDatabase(db));
  } else {
    console.log("Database already seeded, skipping.");
  }
} finally {
  await db.$disconnect();
}
