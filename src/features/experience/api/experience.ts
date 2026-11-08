import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/list-params";
import type { Paginated } from "@/lib/api/types";
import type {
  ExperienceDetail,
  ExperienceInput,
  ExperienceListParams,
  ExperienceRow,
} from "../schemas/experience";

export const experienceKeys = {
  all: ["experience"] as const,
  lists: () => [...experienceKeys.all, "list"] as const,
  list: (params: ExperienceListParams) => [...experienceKeys.lists(), params] as const,
  details: () => [...experienceKeys.all, "detail"] as const,
  detail: (id: string) => [...experienceKeys.details(), id] as const,
};

const base = "/api/admin/experience";

export const experienceApi = {
  list: (params: ExperienceListParams) =>
    apiFetch<Paginated<ExperienceRow>>(`${base}${toSearchParams(params)}`),
  get: (id: string) => apiFetch<ExperienceDetail>(`${base}/${id}`),
  create: (input: ExperienceInput) =>
    apiFetch<ExperienceDetail>(base, { method: "POST", json: input }),
  update: (id: string, input: ExperienceInput) =>
    apiFetch<ExperienceDetail>(`${base}/${id}`, { method: "PATCH", json: input }),
  remove: (id: string) => apiFetch<void>(`${base}/${id}`, { method: "DELETE" }),
};
