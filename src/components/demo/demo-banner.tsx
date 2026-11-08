import { connection } from "next/server";
import { Suspense } from "react";
import { isDemoMode } from "@/lib/env";

/**
 * Demo mode is a runtime setting (DEMO_MODE), so the banner is rendered at
 * request time. Reading it during the build would bake in the build's value.
 */
async function Banner() {
  await connection();
  if (!isDemoMode()) return null;
  return (
    <aside
      aria-label="Demo notice"
      className="bg-brand px-4 py-2 text-center text-sm text-brand-foreground"
    >
      This is a public demo of folio-cms. Sign in to the admin and change anything: all content
      resets every night.
    </aside>
  );
}

export function DemoBanner() {
  return (
    <Suspense>
      <Banner />
    </Suspense>
  );
}
