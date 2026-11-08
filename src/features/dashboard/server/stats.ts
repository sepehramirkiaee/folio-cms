import "server-only";
import { latestMessages } from "@/features/messages/server/messages";
import type { MessageRow } from "@/features/messages/schemas/message";
import { getDb } from "@/lib/db";

export type DashboardStats = {
  projects: { total: number; published: number; featured: number };
  experience: number;
  skills: number;
  messages: { total: number; unread: number };
  latestMessages: MessageRow[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDb();
  const [projects, published, featured, experience, skills, messages, unread, latest] =
    await Promise.all([
      db.project.count(),
      db.project.count({ where: { status: "PUBLISHED" } }),
      db.project.count({ where: { featured: true, status: "PUBLISHED" } }),
      db.experience.count(),
      db.skill.count(),
      db.contactMessage.count(),
      db.contactMessage.count({ where: { isRead: false } }),
      latestMessages(5),
    ]);
  return {
    projects: { total: projects, published, featured },
    experience,
    skills,
    messages: { total: messages, unread },
    latestMessages: latest,
  };
}
