"use client";

import {
  ArrowRight,
  Briefcase,
  FolderKanban,
  Inbox,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "../hooks/use-dashboard-stats";

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

function StatCard({
  href,
  label,
  value,
  detail,
  icon: Icon,
}: {
  href: string;
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors group-hover:border-foreground/20">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            {label}
            <Icon className="size-4" aria-hidden />
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
      </Card>
    </Link>
  );
}

export function Dashboard() {
  const { data, isPending, isError } = useDashboardStats();

  return (
    <>
      <PageHeader title="Dashboard" description="An overview of your portfolio content." />
      {isError ? (
        <p className="text-destructive">Could not load the dashboard. Please refresh the page.</p>
      ) : (
        <div className="space-y-6">
          <section aria-label="Content counts" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isPending ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36" />)
            ) : (
              <>
                <StatCard
                  href="/admin/projects"
                  label="Projects"
                  value={data.projects.total}
                  detail={`${data.projects.published} published, ${data.projects.featured} featured`}
                  icon={FolderKanban}
                />
                <StatCard
                  href="/admin/experience"
                  label="Experience"
                  value={data.experience}
                  detail="Roles on your timeline"
                  icon={Briefcase}
                />
                <StatCard
                  href="/admin/skills"
                  label="Skills"
                  value={data.skills}
                  detail="Tags for projects and roles"
                  icon={Sparkles}
                />
                <StatCard
                  href="/admin/inbox"
                  label="Messages"
                  value={data.messages.total}
                  detail={`${data.messages.unread} unread`}
                  icon={Inbox}
                />
              </>
            )}
          </section>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                <h2>Latest messages</h2>
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/inbox">
                  Open inbox <ArrowRight aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <Skeleton className="h-40" />
              ) : data.latestMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                <ul className="divide-y">
                  {data.latestMessages.map((m) => (
                    <li key={m.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <span
                        className={cn("mt-2 size-2 shrink-0 rounded-full", !m.isRead && "bg-brand")}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm", !m.isRead && "font-semibold")}>
                          {m.name}: {m.subject ?? "No subject"}
                          {!m.isRead && <span className="sr-only"> (unread)</span>}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">{m.message}</p>
                      </div>
                      <time
                        dateTime={m.createdAt}
                        className="shrink-0 text-xs whitespace-nowrap text-muted-foreground"
                      >
                        {timeAgo(m.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
