import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { listPublishedSlugs } from "@/features/projects/server/public";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = siteUrl();
  const projects = await listPublishedSlugs();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.8,
    })),
  ];
}
