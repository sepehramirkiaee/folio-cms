"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/admin/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUiStore } from "@/stores/ui-store";
import { ProjectReorderList } from "./project-reorder-list";
import { ProjectsTable } from "./projects-table";

export function ProjectsPage() {
  const tab = useUiStore((s) => s.projectsTab);
  const setTab = useUiStore((s) => s.setProjectsTab);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Case studies shown on your portfolio."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus aria-hidden /> New project
            </Link>
          </Button>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="list">All projects</TabsTrigger>
          <TabsTrigger value="order">Display order</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <ProjectsTable />
        </TabsContent>
        <TabsContent value="order" className="mt-4 max-w-2xl">
          <ProjectReorderList />
        </TabsContent>
      </Tabs>
    </>
  );
}
