import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/admin/page-header";
import { ProjectForm } from "@/features/projects/components/project-form";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <>
      <PageHeader title="New project" description="Add a case study to your portfolio." />
      <ProjectForm />
    </>
  );
}
