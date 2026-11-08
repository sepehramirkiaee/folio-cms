import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/list-params";
import type { Paginated } from "@/lib/api/types";
import type { SkillInput, SkillListParams, SkillOption, SkillRow } from "../schemas/skill";

export const skillKeys = {
  all: ["skills"] as const,
  lists: () => [...skillKeys.all, "list"] as const,
  list: (params: SkillListParams) => [...skillKeys.lists(), params] as const,
  options: () => [...skillKeys.all, "options"] as const,
  details: () => [...skillKeys.all, "detail"] as const,
  detail: (id: string) => [...skillKeys.details(), id] as const,
};

const base = "/api/admin/skills";

export const skillsApi = {
  list: (params: SkillListParams) =>
    apiFetch<Paginated<SkillRow>>(`${base}${toSearchParams(params)}`),
  options: () => apiFetch<SkillOption[]>(`${base}/options`),
  get: (id: string) => apiFetch<SkillRow>(`${base}/${id}`),
  create: (input: SkillInput) => apiFetch<SkillRow>(base, { method: "POST", json: input }),
  update: (id: string, input: SkillInput) =>
    apiFetch<SkillRow>(`${base}/${id}`, { method: "PATCH", json: input }),
  remove: (id: string) => apiFetch<void>(`${base}/${id}`, { method: "DELETE" }),
};
