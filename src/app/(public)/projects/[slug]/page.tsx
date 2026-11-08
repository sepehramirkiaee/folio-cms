import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedProject } from "@/features/projects/server/public";
import { toParagraphs } from "@/lib/text";

type Props = PageProps<"/projects/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const project = await getPublishedProject((await params).slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary, type: "article" },
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

async function ProjectDetail({ params }: Pick<Props, "params">) {
  await connection();
  const project = await getPublishedProject((await params).slug);
  if (!project) notFound();

  const links = [
    project.liveUrl && { href: project.liveUrl, label: "Visit the live site" },
    project.repoUrl && { href: project.repoUrl, label: "View the source code" },
  ].filter((l): l is { href: string; label: string } => Boolean(l));

  return (
    <article className="mx-auto max-w-3xl px-4 pt-8 pb-24 sm:px-8 sm:pt-12">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden /> All work
      </Link>

      <header className="mt-10">
        <h1 className="text-4xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-muted-foreground">{project.summary}</p>
        <dl className="mt-8 grid gap-4 border-y py-5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-10">
          {project.year && (
            <div>
              <dt className="text-muted-foreground">Year</dt>
              <dd className="mt-0.5 tabular-nums">{project.year}</dd>
            </div>
          )}
          {project.skills.length > 0 && (
            <div>
              <dt className="text-muted-foreground">Built with</dt>
              <dd className="mt-0.5">{project.skills.map((s) => s.name).join(", ")}</dd>
            </div>
          )}
        </dl>
      </header>

      {project.coverImageUrl && (
        <Image
          src={project.coverImageUrl}
          alt=""
          width={1200}
          height={675}
          // Covers come from any host the admin enters, so they skip the optimizer.
          unoptimized
          className="mt-10 w-full rounded-lg border object-cover"
        />
      )}

      <div className="mt-10 space-y-5 text-lg leading-[1.75]">
        {toParagraphs(project.body).map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>

      {links.length > 0 && (
        <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label} <ExternalLink className="size-4" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto max-w-3xl space-y-6 px-4 pt-20 sm:px-8"
          aria-busy
          aria-label="Loading"
        >
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      }
    >
      <ProjectDetail params={params} />
    </Suspense>
  );
}
