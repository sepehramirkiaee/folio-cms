"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/admin/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError } from "@/lib/api/client";
import { useExperience } from "../hooks/use-experience";
import { ExperienceForm } from "./experience-form";

export function EditExperience({ id }: { id: string }) {
  const { data: entry, isPending, error } = useExperience(id);

  if (isPending) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (error) {
    const notFound = error instanceof ApiClientError && error.status === 404;
    return (
      <div className="space-y-4">
        <PageHeader title={notFound ? "Entry not found" : "Could not load this entry"} />
        <Button asChild variant="outline">
          <Link href="/admin/experience">Back to experience</Link>
        </Button>
      </div>
    );
  }
  return (
    <>
      <PageHeader title={entry.role} description={entry.company} />
      <ExperienceForm key={entry.id} entry={entry} />
    </>
  );
}
