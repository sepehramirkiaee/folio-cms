import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoBanner } from "@/components/demo/demo-banner";
import { AdminShell } from "@/components/layout/admin/admin-shell";
import { UserMenu } from "@/components/layout/admin/user-menu";
import { QueryProvider } from "@/components/providers/query-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdminPage } from "@/features/auth/server/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false },
};

/** Server-side session check. proxy.ts already redirects, this is defense in depth. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}

async function SessionUserMenu() {
  const session = await requireAdminPage();
  return <UserMenu name={session.user.name} email={session.user.email} />;
}

export default function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <QueryProvider>
      <AdminShell
        banner={<DemoBanner />}
        userMenu={
          <Suspense fallback={<Skeleton className="size-9 rounded-md" />}>
            <SessionUserMenu />
          </Suspense>
        }
      >
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </AdminShell>
    </QueryProvider>
  );
}
