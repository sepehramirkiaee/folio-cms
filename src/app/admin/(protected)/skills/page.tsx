import type { Metadata } from "next";
import { SkillsTable } from "@/features/skills/components/skills-table";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return <SkillsTable />;
}
