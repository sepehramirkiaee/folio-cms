import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/list-params";
import type { Paginated } from "@/lib/api/types";
import type { MessageListParams, MessageRow, MessageUpdate } from "../schemas/message";

export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (params: MessageListParams) => [...messageKeys.lists(), params] as const,
};

const base = "/api/admin/messages";

export const messagesApi = {
  list: (params: MessageListParams) =>
    apiFetch<Paginated<MessageRow>>(`${base}${toSearchParams(params)}`),
  update: (id: string, data: MessageUpdate) =>
    apiFetch<MessageRow>(`${base}/${id}`, { method: "PATCH", json: data }),
  remove: (id: string) => apiFetch<void>(`${base}/${id}`, { method: "DELETE" }),
};
