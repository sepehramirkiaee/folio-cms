// Wipes all content and reseeds the demo data. Meant for a nightly cron on a
// public demo. Refuses to run unless DEMO_MODE=true or --force is passed, so
// it cannot wipe a real portfolio by accident.
import { getDb } from "../src/lib/db.ts";
import { printLogin, seedDatabase, wipeDatabase } from "../prisma/seed-lib.ts";

const demo = process.env.DEMO_MODE === "true" || process.env.DEMO_MODE === "1";
if (!demo && !process.argv.includes("--force")) {
  console.error("Refusing to reset: DEMO_MODE is not true. Pass --force to reset anyway.");
  process.exit(1);
}

const db = getDb();
try {
  await wipeDatabase(db);
  printLogin(await seedDatabase(db));
  console.log(`Demo data reset at ${new Date().toISOString()}`);
} finally {
  await db.$disconnect();
}
