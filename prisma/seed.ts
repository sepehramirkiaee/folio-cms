// Entry point for `prisma db seed` and `npm run db:seed`.
// Seeds an empty database. Pass --reset to wipe and reseed.
import { getDb } from "../src/lib/db.ts";
import { isDatabaseEmpty, printLogin, seedDatabase, wipeDatabase } from "./seed-lib.ts";

const db = getDb();
const reset = process.argv.includes("--reset");

try {
  if (reset) {
    await wipeDatabase(db);
  } else if (!(await isDatabaseEmpty(db))) {
    console.log("Database already has data, skipping seed. Use --reset to wipe and reseed.");
    process.exit(0);
  }
  printLogin(await seedDatabase(db));
} finally {
  await db.$disconnect();
}
