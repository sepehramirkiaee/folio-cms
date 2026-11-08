import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getProfile } from "@/features/profile/server/profile";

const sections = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

async function SiteName() {
  // Content comes from the database at request time, never at build time.
  await connection();
  const { fullName } = await getProfile();
  return <>{fullName || "Portfolio"}</>;
}

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <Link
        href="/"
        className="rounded text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Suspense fallback={<span className="inline-block w-24" aria-hidden />}>
          <SiteName />
        </Suspense>
      </Link>
      <nav aria-label="Sections" className="flex items-center gap-1">
        <ul className="hidden items-center gap-1 sm:flex">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="rounded px-2.5 py-1.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/#contact"
          className="rounded px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
        >
          Contact
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
