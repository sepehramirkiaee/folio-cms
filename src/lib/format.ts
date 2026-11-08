const monthFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2024-03" -> "Mar 2024" */
export function formatMonth(month: string): string {
  return monthFormat.format(new Date(`${month}-01T00:00:00Z`));
}

/** "Mar 2021 to Present" style ranges for experience entries. */
export function formatMonthRange(start: string, end: string | null): string {
  return `${formatMonth(start)} to ${end ? formatMonth(end) : "Present"}`;
}
