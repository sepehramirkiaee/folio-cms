import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EditProject } from "@/features/projects/components/edit-project";

export const metadata: Metadata = { title: "Edit project" };

// params is URL data: read it inside Suspense so navigation stays instant.
export default function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <EditProjectFromParams params={params} />
    </Suspense>
  );
}

async function EditProjectFromParams({
  params,
}: Pick<PageProps<"/admin/projects/[id]">, "params">) {
  const { id } = await params;
  return <EditProject id={id} />;
}
