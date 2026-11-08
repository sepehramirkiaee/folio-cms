import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteFooter } from "@/components/layout/public/site-footer";
import { SiteHeader } from "@/components/layout/public/site-header";
import { getProfile } from "@/features/profile/server/profile";

/** Public page titles end with the portfolio owner's name, not the app name. */
export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { fullName } = await getProfile();
  return {
    title: { default: fullName || "Portfolio", template: `%s | ${fullName || "Portfolio"}` },
  };
}

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
