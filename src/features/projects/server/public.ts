import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

// Read-only queries for the public site. Only published projects are ever
// returned, so drafts cannot leak through a guessed URL.

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  year: true,
  featured: true,
  skills: { select: { name: true }, orderBy: { name: "asc" } },
} satisfies Prisma.ProjectSelect;

export type PublicProjectCard = Prisma.ProjectGetPayload<{ select: typeof cardSelect }>;

export async function listPublishedProjects(): Promise<PublicProjectCard[]> {
  return getDb().project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    select: cardSelect,
  });
}

/** Cached per request, so metadata and the page share one query. */
export const getPublishedProject = cache(async (slug: string) =>
  getDb().project.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      ...cardSelect,
      body: true,
      liveUrl: true,
      repoUrl: true,
      coverImageUrl: true,
      updatedAt: true,
    },
  }),
);

export async function listPublishedSlugs() {
  return getDb().project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { sortOrder: "asc" },
  });
}
