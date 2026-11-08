import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Section } from "@/components/layout/public/section";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactForm } from "@/features/contact/components/contact-form";
import { Timeline } from "@/features/experience/components/public/timeline";
import { listTimeline } from "@/features/experience/server/public";
import { Hero } from "@/features/profile/components/hero";
import { getProfile } from "@/features/profile/server/profile";
import { WorkList } from "@/features/projects/components/public/work-list";
import { listPublishedProjects } from "@/features/projects/server/public";
import { SkillGroups } from "@/features/skills/components/public/skill-groups";
import { listSkillGroups } from "@/features/skills/server/public";
import { isDemoMode } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const profile = await getProfile();
  const title = profile.fullName ? `${profile.fullName}, ${profile.headline}` : "Portfolio";
  return {
    title: { absolute: title },
    description: profile.headline,
    openGraph: { title, description: profile.headline, type: "profile" },
  };
}

// The page reads the database on every request, so content edited in the
// admin shows up immediately and the Docker build never needs a database.
async function HomeContent() {
  await connection();
  const [profile, projects, timeline, skills] = await Promise.all([
    getProfile(),
    listPublishedProjects(),
    listTimeline(),
    listSkillGroups(),
  ]);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.headline,
    ...(profile.email && { email: profile.email }),
    sameAs: [profile.githubUrl, profile.linkedinUrl].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify escapes quotes; "<" is escaped so content cannot close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero profile={profile} />
      <Section id="work" title="Selected work" intro="Case studies, most relevant first.">
        <WorkList projects={projects} />
      </Section>
      <Section id="experience" title="Experience">
        <Timeline entries={timeline} />
      </Section>
      <Section id="skills" title="Skills">
        <SkillGroups groups={skills} />
      </Section>
      <Section
        id="contact"
        title="Contact"
        intro="Hiring, a project, or a question about my work. Send a message and I will reply by email."
      >
        <ContactForm demoNotice={isDemoMode()} />
      </Section>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pt-20 sm:px-8" aria-busy aria-label="Loading">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-16 w-full max-w-2xl" />
      <Skeleton className="h-24 w-full max-w-xl" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
