import type { ProjectStatus, SkillCategory } from "../src/generated/prisma/enums.ts";

// Demo content for a fictional senior frontend engineer. Realistic enough that
// the public site and the admin tables look like a real portfolio.

export const profile = {
  fullName: "Alex Rivera",
  headline: "Senior frontend engineer building fast, accessible web platforms",
  bio: [
    "I have spent fifteen years building web platforms, from server-rendered PHP storefronts to design systems used by hundreds of engineers.",
    "These days I lead frontend architecture: React and Next.js applications, typed APIs, testing strategy, and the developer experience around them. I also use AI agents daily, with clear conventions and human review on every change.",
  ].join("\n\n"),
  location: "Remote, Europe",
  email: "hello@alexrivera.dev",
  githubUrl: "https://github.com/alexrivera-demo",
  linkedinUrl: "https://www.linkedin.com/in/alexrivera-demo",
  avatarUrl: null,
};

type SkillSeed = { name: string; category: SkillCategory; featured?: boolean };

export const skills: SkillSeed[] = [
  { name: "TypeScript", category: "FRONTEND" },
  { name: "React", category: "FRONTEND" },
  { name: "Next.js", category: "FRONTEND" },
  { name: "Tailwind CSS", category: "FRONTEND" },
  { name: "Accessibility", category: "FRONTEND" },
  { name: "Web Performance", category: "FRONTEND" },
  { name: "Design Systems", category: "DESIGN" },
  { name: "Figma", category: "DESIGN" },
  { name: "Storybook", category: "DESIGN" },
  { name: "Vue.js", category: "FRONTEND", featured: false },
  { name: "jQuery", category: "FRONTEND", featured: false },
  { name: "Node.js", category: "BACKEND" },
  { name: "GraphQL", category: "BACKEND" },
  { name: "REST APIs", category: "BACKEND" },
  { name: "PHP", category: "BACKEND", featured: false },
  { name: "PostgreSQL", category: "DATA" },
  { name: "Prisma", category: "DATA" },
  { name: "Redis", category: "DATA", featured: false },
  { name: "Docker", category: "DEVOPS" },
  { name: "GitHub Actions", category: "DEVOPS" },
  { name: "Vercel", category: "DEVOPS" },
  { name: "AWS", category: "DEVOPS", featured: false },
  { name: "Playwright", category: "DEVOPS" },
  { name: "Vitest", category: "DEVOPS" },
  { name: "Claude Code", category: "AI" },
  { name: "LLM Integration", category: "AI" },
  { name: "Prompt Engineering", category: "AI" },
];

type ProjectSeed = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  year: number;
  status: ProjectStatus;
  featured: boolean;
  liveUrl?: string;
  repoUrl?: string;
  skills: string[];
};

export const projects: ProjectSeed[] = [
  {
    slug: "checkout-platform-rebuild",
    title: "Checkout platform rebuild",
    summary:
      "Rebuilt a payments checkout used by 2,000 merchants as a Next.js app, cutting time to interactive by 58% and lifting conversion by 4.2%.",
    body: [
      "The legacy checkout was a jQuery bundle injected into merchant pages. Every merchant theme could break it, and a single deploy took a full day of manual QA.",
      "I led a team of five to replace it with a hosted Next.js checkout behind a typed API. We shipped behind a per-merchant flag, migrated the 50 largest merchants by hand, and then moved the long tail automatically.",
      "Key decisions: a strict boundary between payment-provider SDKs and our UI, contract tests on every API response, and a Playwright suite that runs each payment method against provider sandboxes on every pull request.",
      "Results: time to interactive dropped from 4.1s to 1.7s on mid-range Android devices, checkout conversion rose 4.2%, and deploys went from weekly to several times a day.",
    ].join("\n\n"),
    year: 2025,
    status: "PUBLISHED",
    featured: true,
    liveUrl: "https://example.com/checkout",
    skills: ["Next.js", "TypeScript", "React", "Web Performance", "Playwright", "REST APIs"],
  },
  {
    slug: "atlas-design-system",
    title: "Atlas design system",
    summary:
      "A themeable React component library and token pipeline adopted by 14 product teams, with accessibility tests built into every component.",
    body: [
      "Atlas started as a shared button and grew into the foundation for every customer-facing surface in the company.",
      "Design tokens are authored in Figma, exported as JSON, and compiled to CSS variables and TypeScript constants in CI. Components are built on accessible primitives, documented in Storybook, and tested with axe and keyboard interaction tests.",
      "I set up the contribution model: an RFC template, a weekly office hour, and a versioning policy with codemods for every breaking change. Adoption went from 2 to 14 teams in a year.",
    ].join("\n\n"),
    year: 2024,
    status: "PUBLISHED",
    featured: true,
    repoUrl: "https://github.com/alexrivera-demo/atlas",
    skills: ["React", "TypeScript", "Design Systems", "Storybook", "Figma", "Accessibility"],
  },
  {
    slug: "support-copilot",
    title: "Support copilot",
    summary:
      "An LLM assistant inside the support console that drafts replies from the knowledge base, with citations and a human approval step.",
    body: [
      "Support agents spent most of their time searching internal docs. The copilot retrieves the relevant articles, drafts a reply with citations, and never sends anything without the agent's approval.",
      "The frontend streams the draft token by token, highlights every citation, and lets the agent accept, edit, or reject each paragraph. Feedback flows back into an evaluation set that runs nightly.",
      "Median handling time dropped 31% in the pilot group, and the evaluation suite caught two regressions before they reached agents.",
    ].join("\n\n"),
    year: 2025,
    status: "PUBLISHED",
    featured: true,
    skills: ["React", "Next.js", "LLM Integration", "Prompt Engineering", "Node.js"],
  },
  {
    slug: "analytics-dashboard",
    title: "Real-time analytics dashboard",
    summary:
      "A merchant dashboard with live charts over 40 million events a day, built on GraphQL subscriptions and virtualized tables.",
    body: [
      "Merchants wanted to see sales as they happened, not the next morning. The dashboard subscribes to aggregated event streams and renders them with virtualized tables and canvas charts.",
      "I designed the GraphQL schema with the backend team, wrote the caching strategy, and kept the main thread under 50ms per frame even with ten live widgets on screen.",
    ].join("\n\n"),
    year: 2023,
    status: "PUBLISHED",
    featured: false,
    skills: ["React", "GraphQL", "TypeScript", "Web Performance", "Redis"],
  },
  {
    slug: "folio-cms",
    title: "folio-cms",
    summary:
      "This site. A portfolio and admin CMS in one Next.js app, built with an AI agent under documented conventions and full human review.",
    body: [
      "folio-cms is a public portfolio plus a protected admin dashboard, in a single Next.js App Router project backed by PostgreSQL.",
      "It shows how I structure a full-stack TypeScript app: Zod schemas shared by API handlers and forms, TanStack Query for server state, Zustand for UI state only, and tests at every level.",
      "The whole thing runs with one Docker command, and the repository documents exactly which parts the AI agent wrote and which decisions were made by hand.",
    ].join("\n\n"),
    year: 2026,
    status: "PUBLISHED",
    featured: true,
    repoUrl: "https://github.com/alexrivera-demo/folio-cms",
    skills: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Docker",
      "Claude Code",
      "Playwright",
    ],
  },
  {
    slug: "accessibility-audit-program",
    title: "Accessibility audit program",
    summary:
      "A company-wide program that took the main web app from 212 WCAG violations to zero critical issues in two quarters.",
    body: [
      "After a customer escalation, I ran an audit of the main app and found 212 WCAG 2.1 AA violations. I grouped them by root cause instead of by page, which turned 212 tickets into 19.",
      "We added axe checks to CI, wrote a keyboard-testing checklist for code review, and trained every frontend engineer in a two-hour workshop. Critical issues reached zero and have stayed there.",
    ].join("\n\n"),
    year: 2022,
    status: "PUBLISHED",
    featured: false,
    skills: ["Accessibility", "Playwright", "React", "Design Systems"],
  },
  {
    slug: "marketing-site-migration",
    title: "Marketing site migration",
    summary:
      "Moved a 600-page marketing site from a PHP CMS to a statically generated Next.js site, with redirects that kept every search ranking.",
    body: [
      "The old site was slow and every content change needed a developer. I migrated it to statically generated pages fed by a headless CMS, with a redirect map generated from analytics data.",
      "Largest Contentful Paint went from 3.8s to 1.1s, and organic traffic grew 22% over the following six months.",
    ].join("\n\n"),
    year: 2021,
    status: "PUBLISHED",
    featured: false,
    skills: ["Next.js", "PHP", "Web Performance", "Vercel"],
  },
  {
    slug: "offline-field-app",
    title: "Offline field inspection app",
    summary:
      "A work in progress: an installable web app for field inspectors that works fully offline and syncs when back online.",
    body: "Draft write-up. Covers the service worker strategy, IndexedDB sync queue, and conflict resolution.",
    year: 2026,
    status: "DRAFT",
    featured: false,
    skills: ["React", "TypeScript", "Web Performance"],
  },
];

type ExperienceSeed = {
  company: string;
  role: string;
  location?: string;
  companyUrl?: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
  skills: string[];
};

export const experience: ExperienceSeed[] = [
  {
    company: "Northwind Payments",
    role: "Senior Frontend Engineer",
    location: "Remote",
    companyUrl: "https://example.com/northwind",
    startDate: "2023-03-01",
    summary:
      "Frontend lead for the merchant-facing platform: checkout, dashboard, and the shared design system.",
    highlights: [
      "Led the checkout rebuild that raised conversion by 4.2%",
      "Introduced typed API contracts and contract tests across four teams",
      "Rolled out AI-assisted development with written conventions and review rules",
    ],
    skills: ["Next.js", "TypeScript", "React", "Playwright", "Claude Code"],
  },
  {
    company: "Brightline Software",
    role: "Staff Frontend Engineer, Design Systems",
    location: "Amsterdam, Netherlands",
    startDate: "2019-06-01",
    endDate: "2023-02-28",
    summary: "Built and ran the Atlas design system and the frontend platform team behind it.",
    highlights: [
      "Grew design system adoption from 2 to 14 product teams",
      "Ran the accessibility program that reached zero critical WCAG issues",
      "Mentored six engineers, three of whom were promoted to senior",
    ],
    skills: ["React", "Design Systems", "Storybook", "Accessibility", "Figma"],
  },
  {
    company: "Corvid Media",
    role: "Frontend Engineer",
    location: "Berlin, Germany",
    startDate: "2016-01-01",
    endDate: "2019-05-31",
    summary: "Built publishing tools and high-traffic article pages for a digital media group.",
    highlights: [
      "Migrated the article renderer from jQuery to React with server-side rendering",
      "Cut page weight by 60% with an image pipeline and code splitting",
    ],
    skills: ["React", "Node.js", "Web Performance", "GraphQL"],
  },
  {
    company: "Studio Lumen",
    role: "Web Developer",
    location: "Lisbon, Portugal",
    startDate: "2013-02-01",
    endDate: "2015-12-31",
    summary:
      "Agency work: marketing sites and e-commerce builds for retail and hospitality clients.",
    highlights: [
      "Delivered more than 40 client sites, from brief to launch",
      "Introduced Git, code review, and staging environments to the studio",
    ],
    skills: ["PHP", "jQuery", "Vue.js"],
  },
  {
    company: "Freelance",
    role: "Web Designer and Developer",
    startDate: "2011-01-01",
    endDate: "2013-01-31",
    summary: "Designed and built websites for small businesses and local organizations.",
    highlights: ["Built 25 sites end to end, including design, hosting, and maintenance"],
    skills: ["PHP", "jQuery"],
  },
];

export const messages = [
  {
    name: "Priya Shah",
    email: "priya.shah@example.com",
    subject: "Frontend lead role",
    message:
      "Hi Alex, I'm hiring a frontend lead for a fintech team in Berlin and your checkout case study is very close to what we need. Would you be open to a short call next week?",
    isRead: false,
    daysAgo: 1,
  },
  {
    name: "Tom Becker",
    email: "tom@example.com",
    subject: "Design system question",
    message:
      "Loved the Atlas write-up. How did you handle versioning when teams were several major versions behind?",
    isRead: false,
    daysAgo: 3,
  },
  {
    name: "Lena Fischer",
    email: "lena.fischer@example.com",
    subject: null,
    message: "Is the folio-cms code available? I'd like to use it for my own portfolio.",
    isRead: true,
    daysAgo: 6,
  },
  {
    name: "Marco Rossi",
    email: "marco@example.com",
    subject: "Speaking invitation",
    message:
      "We run a frontend meetup in Lisbon and would love a talk on accessibility programs. Interested?",
    isRead: true,
    daysAgo: 12,
  },
];
