import { execFileSync } from "node:child_process";

/** Every run starts from the seed content, so tests can rely on it. */
export default function globalSetup() {
  // Locally DATABASE_URL comes from .env; in CI it is set by the workflow.
  try {
    process.loadEnvFile();
  } catch {
    // no .env file
  }
  execFileSync("node", ["scripts/reset-demo.ts", "--force"], { stdio: "inherit" });
}
