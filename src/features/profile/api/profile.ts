import { apiFetch } from "@/lib/api/client";
import type { Profile, ProfileInput } from "../schemas/profile";

export const profileKeys = { all: ["profile"] as const };

export const profileApi = {
  get: () => apiFetch<Profile>("/api/admin/profile"),
  save: (input: ProfileInput) =>
    apiFetch<Profile>("/api/admin/profile", { method: "PUT", json: input }),
};
