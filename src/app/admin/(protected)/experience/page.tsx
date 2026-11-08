import type { Metadata } from "next";
import { ExperienceTable } from "@/features/experience/components/experience-table";

export const metadata: Metadata = { title: "Experience" };

export default function ExperiencePage() {
  return <ExperienceTable />;
}
