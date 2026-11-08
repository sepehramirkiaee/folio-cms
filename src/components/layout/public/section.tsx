import type { ReactNode } from "react";

/** A home page section: heading in a narrow left column on wide screens. */
export function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="mx-auto grid max-w-5xl scroll-mt-8 gap-8 border-t px-4 py-16 sm:px-8 lg:grid-cols-[13rem_1fr] lg:gap-12"
    >
      <div>
        <h2 id={`${id}-heading`} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {intro && <p className="mt-2 text-sm text-muted-foreground">{intro}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
