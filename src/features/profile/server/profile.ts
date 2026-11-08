import "server-only";
import { cache } from "react";
import { getDb } from "@/lib/db";
import type { Profile, ProfileInput } from "../schemas/profile";

const select = {
  fullName: true,
  headline: true,
  bio: true,
  location: true,
  email: true,
  githubUrl: true,
  linkedinUrl: true,
  avatarUrl: true,
  updatedAt: true,
} as const;

const empty: ProfileInput = {
  fullName: "",
  headline: "",
  bio: "",
  location: null,
  email: null,
  githubUrl: null,
  linkedinUrl: null,
  avatarUrl: null,
};

/** The singleton profile, or empty values if it was never created. Cached per request. */
export const getProfile = cache(async (): Promise<Profile> => {
  const profile = await getDb().profile.findUnique({ where: { id: 1 }, select });
  if (!profile) return { ...empty, updatedAt: new Date(0).toISOString() };
  return { ...profile, updatedAt: profile.updatedAt.toISOString() };
});

export async function saveProfile(input: ProfileInput): Promise<Profile> {
  const profile = await getDb().profile.upsert({
    where: { id: 1 },
    create: { id: 1, ...input },
    update: input,
    select,
  });
  return { ...profile, updatedAt: profile.updatedAt.toISOString() };
}
