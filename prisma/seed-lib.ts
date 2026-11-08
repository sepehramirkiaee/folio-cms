import type { PrismaClient } from "../src/generated/prisma/client.ts";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "../src/lib/admin-defaults.ts";
import { hashPassword } from "../src/lib/password.ts";
import { slugify } from "../src/lib/slug.ts";
import * as data from "./seed-data.ts";

export function adminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  };
}

/** True when no admin user exists yet, which is how a fresh database is detected. */
export async function isDatabaseEmpty(db: PrismaClient): Promise<boolean> {
  return (await db.user.count()) === 0;
}

/** Deletes every row. Join tables for many-to-many relations cascade. */
export async function wipeDatabase(db: PrismaClient): Promise<void> {
  await db.$transaction([
    db.contactMessage.deleteMany(),
    db.project.deleteMany(),
    db.experience.deleteMany(),
    db.skill.deleteMany(),
    db.profile.deleteMany(),
    db.user.deleteMany(),
  ]);
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export async function seedDatabase(db: PrismaClient): Promise<{ email: string; password: string }> {
  const { email, password } = adminCredentials();
  const isDemo = email === DEFAULT_ADMIN_EMAIL;

  await db.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        email,
        name: isDemo ? "Demo Admin" : "Admin",
        passwordHash: await hashPassword(password),
        isDemo,
      },
    });

    await tx.profile.create({ data: { id: 1, ...data.profile } });

    await tx.skill.createMany({
      data: data.skills.map((s) => ({
        name: s.name,
        slug: slugify(s.name),
        category: s.category,
        featured: s.featured ?? true,
      })),
    });
    const connectSkills = (names: string[]) => ({
      connect: names.map((name) => ({ slug: slugify(name) })),
    });

    for (const [index, p] of data.projects.entries()) {
      const { skills, ...fields } = p;
      await tx.project.create({
        data: { ...fields, sortOrder: index, skills: connectSkills(skills) },
      });
    }

    for (const e of data.experience) {
      const { skills, startDate, endDate, ...fields } = e;
      await tx.experience.create({
        data: {
          ...fields,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          skills: connectSkills(skills),
        },
      });
    }

    await tx.contactMessage.createMany({
      data: data.messages.map(({ daysAgo: d, ...m }) => ({ ...m, createdAt: daysAgo(d) })),
    });
  });

  return { email, password };
}

export function printLogin({ email, password }: { email: string; password: string }) {
  const url = process.env.AUTH_URL || "http://localhost:3000";
  const lines = [
    "",
    "  folio-cms is seeded and ready.",
    "",
    `  Admin:    ${url.replace(/\/$/, "")}/admin`,
    `  Email:    ${email}`,
    `  Password: ${password}`,
    "",
  ];
  console.log(lines.join("\n"));
}
