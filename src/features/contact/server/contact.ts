import "server-only";
import { assertDemoCapacity } from "@/lib/demo";
import { getDb } from "@/lib/db";
import type { ContactInput } from "../schemas/contact";

/** Saves a contact message. Honeypot hits are accepted but never stored. */
export async function submitContactMessage({ website, ...input }: ContactInput): Promise<void> {
  if (website) return;
  await assertDemoCapacity("contactMessage");
  await getDb().contactMessage.create({ data: input });
}
