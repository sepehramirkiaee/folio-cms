import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EditExperience } from "@/features/experience/components/edit-experience";

export const metadata: Metadata = { title: "Edit experience" };

// params is URL data: read it inside Suspense so navigation stays instant.
export default function EditExperiencePage({ params }: PageProps<"/admin/experience/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-3xl" />}>
      <EditFromParams params={params} />
    </Suspense>
  );
}

async function EditFromParams({ params }: Pick<PageProps<"/admin/experience/[id]">, "params">) {
  const { id } = await params;
  return <EditExperience id={id} />;
}
