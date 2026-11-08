import Link from "next/link";
import type { PublicProjectCard } from "../../server/public";

/**
 * Projects as a list of rows rather than a card grid: the title and summary
 * are what a reader scans, and rows keep them aligned and easy to compare.
 */
export function WorkList({ projects }: { projects: PublicProjectCard[] }) {
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);

  if (projects.length === 0) {
    return (
      <p className="text-muted-foreground">Projects will appear here once they are published.</p>
    );
  }

  return (
    <div className="space-y-12">
      <ol className="divide-y border-y">
        {(featured.length ? featured : projects).map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.slug}`}
              className="group -mx-3 grid gap-2 rounded-md px-3 py-6 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[1fr_auto] sm:gap-8"
            >
              <div>
                <h3 className="text-lg font-semibold tracking-tight underline-offset-4 group-hover:underline">
                  {project.title}
                </h3>
                <p className="mt-1.5 max-w-[60ch] leading-relaxed text-muted-foreground">
                  {project.summary}
                </p>
                {project.skills.length > 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {project.skills.map((s) => s.name).join(", ")}
                  </p>
                )}
              </div>
              {project.year && (
                <span className="text-sm text-muted-foreground tabular-nums sm:pt-1">
                  {project.year}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>

      {featured.length > 0 && more.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium">More projects</h3>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {more.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="rounded underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {project.title}
                </Link>
                {project.year && (
                  <span className="ml-2 text-sm text-muted-foreground tabular-nums">
                    {project.year}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
