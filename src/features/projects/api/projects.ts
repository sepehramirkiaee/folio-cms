import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/list-params";
import type { Paginated } from "@/lib/api/types";
import type {
  ProjectDetail,
  ProjectInput,
  ProjectListParams,
  ProjectOrderItem,
  ProjectRow,
} from "../schemas/project";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: ProjectListParams) => [...projectKeys.lists(), params] as const,
  order: () => [...projectKeys.all, "order"] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

const base = "/api/admin/projects";

export const projectsApi = {
  list: (params: ProjectListParams) =>
    apiFetch<Paginated<ProjectRow>>(`${base}${toSearchParams(params)}`),
  order: () => apiFetch<ProjectOrderItem[]>(`${base}/order`),
  saveOrder: (ids: string[]) =>
    apiFetch<ProjectOrderItem[]>(`${base}/order`, { method: "PUT", json: { ids } }),
  get: (id: string) => apiFetch<ProjectDetail>(`${base}/${id}`),
  create: (input: ProjectInput) => apiFetch<ProjectDetail>(base, { method: "POST", json: input }),
  update: (id: string, input: ProjectInput) =>
    apiFetch<ProjectDetail>(`${base}/${id}`, { method: "PATCH", json: input }),
  remove: (id: string) => apiFetch<void>(`${base}/${id}`, { method: "DELETE" }),
};
