import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/admin/page-header";
import { ExperienceForm } from "@/features/experience/components/experience-form";

export const metadata: Metadata = { title: "Add experience" };

export default function NewExperiencePage() {
  return (
    <>
      <PageHeader title="Add experience" description="A role for your timeline." />
      <ExperienceForm />
    </>
  );
}
