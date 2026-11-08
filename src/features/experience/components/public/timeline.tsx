import { formatMonth } from "@/lib/format";
import type { TimelineEntry } from "../../server/public";

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground">No experience added yet.</p>;
  }
  return (
    <ol className="relative space-y-10 border-l pl-6 sm:pl-8">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            className={
              entry.endDate === null
                ? "absolute top-1.5 -left-[calc(1.5rem+4.5px)] size-2.5 rounded-full bg-brand sm:-left-[calc(2rem+4.5px)]"
                : "absolute top-1.5 -left-[calc(1.5rem+4.5px)] size-2.5 rounded-full border border-muted-foreground bg-background sm:-left-[calc(2rem+4.5px)]"
            }
            aria-hidden
          />
          <p className="text-sm text-muted-foreground tabular-nums">
            <time dateTime={entry.startDate}>{formatMonth(entry.startDate)}</time> to{" "}
            {entry.endDate ? (
              <time dateTime={entry.endDate}>{formatMonth(entry.endDate)}</time>
            ) : (
              "present"
            )}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            {entry.role},{" "}
            {entry.companyUrl ? (
              <a
                href={entry.companyUrl}
                className="rounded underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {entry.company}
              </a>
            ) : (
              entry.company
            )}
          </h3>
          {entry.location && <p className="text-sm text-muted-foreground">{entry.location}</p>}
          <p className="mt-3 max-w-[62ch] leading-relaxed">{entry.summary}</p>
          {entry.highlights.length > 0 && (
            <ul className="mt-3 max-w-[62ch] list-disc space-y-1 pl-5 text-muted-foreground">
              {entry.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
