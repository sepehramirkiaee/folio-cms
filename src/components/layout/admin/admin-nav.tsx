"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";
import { cn } from "@/lib/utils";
import { adminNavItems } from "./nav-items";

type AdminNavProps = { collapsed?: boolean; onNavigate?: () => void };

/**
 * The active link depends on the URL, which is request data under Cache
 * Components. The Suspense fallback renders the same links without the
 * active state, so the nav is in the static shell.
 */
export function AdminNav(props: AdminNavProps) {
  return (
    <Suspense fallback={<NavLinks {...props} pathname={null} />}>
      <ActiveNavLinks {...props} />
    </Suspense>
  );
}

function ActiveNavLinks(props: AdminNavProps) {
  return <NavLinks {...props} pathname={usePathname()} />;
}

function NavLinks({
  collapsed = false,
  onNavigate,
  pathname,
}: AdminNavProps & { pathname: string | null }) {
  return (
    <nav aria-label="Admin">
      <ul className="flex flex-col gap-1">
        {adminNavItems.map(({ href, label, icon: Icon, showUnread }) => {
          const active =
            pathname !== null &&
            (href === "/admin" ? pathname === href : pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className={cn(collapsed && "sr-only")}>{label}</span>
                {showUnread && <UnreadCount collapsed={collapsed} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function UnreadCount({ collapsed }: { collapsed: boolean }) {
  const unread = useDashboardStats().data?.messages.unread ?? 0;
  if (unread === 0) return null;
  return (
    <span
      className={cn(
        "rounded-full bg-brand px-1.5 text-xs leading-5 font-semibold text-brand-foreground tabular-nums",
        collapsed ? "sr-only" : "ml-auto",
      )}
    >
      {unread}
      <span className="sr-only"> unread</span>
    </span>
  );
}
