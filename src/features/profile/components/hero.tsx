import { Mail, MapPin } from "lucide-react";
import { toParagraphs } from "@/lib/text";
import type { Profile } from "../schemas/profile";

export function Hero({ profile }: { profile: Profile }) {
  const links = [
    profile.email && { href: `mailto:${profile.email}`, label: profile.email, icon: Mail },
    profile.githubUrl && { href: profile.githubUrl, label: "GitHub", icon: null },
    profile.linkedinUrl && { href: profile.linkedinUrl, label: "LinkedIn", icon: null },
  ].filter((l) => l !== null && l !== "");

  return (
    <section
      aria-labelledby="intro-heading"
      className="mx-auto max-w-5xl px-4 pt-12 pb-20 sm:px-8 sm:pt-20 sm:pb-28"
    >
      <p className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{profile.fullName}</span>
        {profile.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {profile.location}
          </span>
        )}
      </p>
      <h1
        id="intro-heading"
        className="max-w-[18ch] text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl"
      >
        {profile.headline}
      </h1>
      <div className="mt-8 max-w-[62ch] space-y-4 text-lg leading-relaxed text-muted-foreground">
        {toParagraphs(profile.bio).map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      {links.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2" aria-label="Contact links">
          {links.map(
            (link) =>
              link && (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.icon && <link.icon className="size-4" aria-hidden />}
                    {link.label}
                  </a>
                </li>
              ),
          )}
        </ul>
      )}
    </section>
  );
}
