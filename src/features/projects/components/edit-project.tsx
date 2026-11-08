"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/admin/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError } from "@/lib/api/client";
import { useProject } from "../hooks/use-projects";
import { ProjectForm } from "./project-form";

export function EditProject({ id }: { id: string }) {
  const { data: project, isPending, error } = useProject(id);

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (error) {
    const notFound = error instanceof ApiClientError && error.status === 404;
    return (
      <div className="space-y-4">
        <PageHeader title={notFound ? "Project not found" : "Could not load project"} />
        <Button asChild variant="outline">
          <Link href="/admin/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={project.title}
        description={
          project.status === "PUBLISHED" ? "Published" : "Draft, not visible on the site"
        }
      />
      {/* Remount when the project changes so the form picks up fresh defaults. */}
      <ProjectForm key={project.id} project={project} />
    </>
  );
}
