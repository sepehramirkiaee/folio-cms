import "server-only";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db";
import { isDemoMode } from "@/lib/env";

/**
 * Upper bounds per table in demo mode. Visitors can create, edit and delete
 * freely (the data resets nightly), but cannot flood the shared demo.
 */
export const DEMO_LIMITS = {
  project: 40,
  experience: 25,
  skill: 80,
  contactMessage: 300,
} as const;

type LimitedModel = keyof typeof DEMO_LIMITS;

const labels: Record<LimitedModel, string> = {
  project: "projects",
  experience: "experience entries",
  skill: "skills",
  contactMessage: "messages",
};

async function countRows(model: LimitedModel): Promise<number> {
  const db = getDb();
  switch (model) {
    case "project":
      return db.project.count();
    case "experience":
      return db.experience.count();
    case "skill":
      return db.skill.count();
    case "contactMessage":
      return db.contactMessage.count();
  }
}

/** Throws before a create that would push a table past its demo limit. */
export async function assertDemoCapacity(model: LimitedModel): Promise<void> {
  if (!isDemoMode()) return;
  if ((await countRows(model)) >= DEMO_LIMITS[model]) {
    throw new ApiError(
      "DEMO_PROTECTED",
      `The demo holds at most ${DEMO_LIMITS[model]} ${labels[model]}. It resets every night.`,
    );
  }
}
