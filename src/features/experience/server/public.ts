import "server-only";
import { getDb } from "@/lib/db";

const toMonth = (date: Date) => date.toISOString().slice(0, 7);

/** The timeline, newest first, with dates as "YYYY-MM" strings. */
export async function listTimeline() {
  const entries = await getDb().experience.findMany({
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      company: true,
      role: true,
      location: true,
      companyUrl: true,
      startDate: true,
      endDate: true,
      summary: true,
      highlights: true,
      skills: { select: { name: true }, orderBy: { name: "asc" } },
    },
  });
  return entries.map(({ startDate, endDate, ...e }) => ({
    ...e,
    startDate: toMonth(startDate),
    endDate: endDate ? toMonth(endDate) : null,
  }));
}

export type TimelineEntry = Awaited<ReturnType<typeof listTimeline>>[number];
